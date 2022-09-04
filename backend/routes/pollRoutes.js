const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const router = express.Router();

//hashmap where pollId -> res set. In the res set is all the res from SSE.
var connected = new Map();

router.get("/updates/:pollId&:userId", async (req, res) => {
    console.log("User Connected")
    res.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      });
      
      const pollId = req.params.pollId
      //const userId = req.params.userId => used in sendUpdates() for owner verification

      if (!ObjectId.isValid(pollId)) {
        res.status(400).json("Invalid ID")
        return;
      }

      //see if the poll already has a set.
      if (connected.get(pollId)) {
          connected.get(pollId).add(res);
        } else {
            //create new set and add res.
            const requests = new Set();
            requests.add(res);
            connected.set(pollId, requests);
        } 
        
        
        //send a ping every 40 seconds to avoid 55 second timeout 
    const ping = setTimeout(() => {
        res.write('event: update'); 
        res.write("\n\n");   
    }, 4000)

    res.on('close', () => {
        console.log('User Disconnected');
        clearInterval(ping);
        
        if (connected.get(pollId).size === 1)
            connected.delete(pollId)
        else
            connected.get(pollId).delete(res);

        res.end();
    });

})


const sendUpdates = async (pollId) => {
    const requests = connected.get(pollId);
    if (!requests) {
        console.log("Error. Response not found");
        return;
    }


    if (ObjectId.isValid(pollId)) {
        var poll = await Poll.findOne({_id: pollId})
        console.log("New Update for " + pollId)
    } else {
        return;
    }

    if (!poll)
        return;

    var ownerOptions = [...poll["options"]]
    var options = [...poll["options"]]


    if (poll['approvalRequired']) {
        options = options.filter(element => element["approved"])
    }

    if (poll['hideVotes']) {
        for (let i = 0; i < options.length; i++) 
            options[i] =  {...options[i].toObject(), "votes" : -1}

        if (poll["hideVotesForOwner"])  {
            for (let i = 0; i < ownerOptions.length; i++) {
                ownerOptions[i] = {...ownerOptions[i].toObject(), "votes" : -1}
            }
        }
    }
    
    

    requests.forEach(res => {
        //shortcuts to true if approval is unnecessary
        const isOwner = res.req.originalUrl.split("&")[1] === poll["owner"];
        
        res.write('event: update\n'); 
        res.write(`data:${JSON.stringify({
            options: isOwner ? ownerOptions : options,

            settings: {
                limitOneVote: poll["limitOneVote"],
                approvalRequired: poll["approvalRequired"],
                autoApproveOwner: poll["autoApproveOwner"],
                hideVotes: poll["hideVotes"],
                disableVoting: poll["disableVoting"],
                hideVotesForOwner: poll["hideVotesForOwner"],
            },
        })}`)
        res.write("\n\n");   
    })
}




router.get("/:id&:user", async (req, res) => {
    const pollId = req.params.id;
    const userId = req.params.user;

    if (ObjectId.isValid(pollId) && ObjectId.isValid(userId)) {        
        var poll = await Poll.findOne({_id: pollId})
        
        if (poll) {
            //add votes object
            if (!await Poll.exists({_id: pollId, "votes.userId": userId})) {
                await Poll.updateOne({_id: pollId}, {
                    $push: {
                        "votes": {
                            userId: userId,
                            optionIds: []
                        }
                    }
                });
                var optionIds = []
            } else {
                const ids = poll["votes"]
                optionIds = ids.find(option => option["userId"] === userId)["optionIds"]
            }


            const isOwner = user === poll["owner"]
            var options = poll["options"]

            if (isOwner) {
                if (poll["hideVotes"] && poll["hideVotesForOwner"])
                    options.forEach(option => option["votes"] = -1)

            } else {
                if (poll['approvalRequired'])
                    options = options.filter(element => element["approved"])
            
                if (poll['hideVotes']) {
                    options.forEach(option => option["votes"] = - 1)
                }
            }
                
            const msg = {
                pollId: poll["_id"],
                title: poll["title"],
                options: options,
                owner: isOwner,
                settings: {
                    limitOneVote: poll["limitOneVote"],
                    approvalRequired: poll["approvalRequired"],
                    autoApproveOwner: poll["autoApproveOwner"],
                    hideVotes: poll["hideVotes"],
                    disableVoting: poll["disableVoting"],
                    hideVotesForOwner: poll["hideVotesForOwner"],
                },
                votedFor: optionIds
            }

            res.status(201).json(msg);
        }  else {
            res.status(400).json("Poll expired or Invalid ID.")
            return;
        }
    } else {
        console.log(pollId + " is not valid")
        res.status(400).json("Poll expired or Invalid ID.")
        return;
    }

});

router.post("/create", async (req, res) => {
    const {title, ownerId} = req.body;
    
    if (title && ObjectId.isValid(ownerId)) {
        var poll = await Poll.create({title: title, owner: ownerId})
    } else {
        res.status(400).json("Error enter title")
        return;
    }


    if (poll) {
        res.status(201).json({pollId: poll.id})
    } else {
        res.status(400).send("Error");
    }

})


router.delete("/delete", async (req, res) => {
    const {pollIds, userId} = req.body;

    const pollsToDelete = pollIds.split(".");

    if (pollsToDelete && ObjectId.isValid(userId)) {
        pollsToDelete.forEach(async (pollId) => {
            if (ObjectId.isValid(pollId)) {
                await Poll.deleteOne({_id: new ObjectId(pollId), owner: userId});

                const requests = connected.get(pollId);
                if (!requests) {
                    console.log("Error. Response not found");
                    return;
                }
            
                requests.forEach(res => { 
                    res.write('event: update\ndata:DELETE\n\n'); 
                })
            } else {
                console.log(pollId + " is not valid");
            }
        })

        res.status(201).json("Deleted");
    } else {
        res.status(410).send("Error. Permission Denied.")
    }

})




router.post("/option", async (req, res) => {
    const {pollId, optionTitle, userId} = req.body;

    if (optionTitle && ObjectId.isValid(pollId) && ObjectId.isValid(userId))
        var poll = await Poll.findOne({_id: pollId})
    else {
        res.status(400).send("Error")  
        return;
    }
    

    if (poll) {
        const result = await Poll.updateOne({_id: pollId}, {
            $push: {
               options: {
                    optionTitle: optionTitle, 
                    votes: 0,
                    approved: !poll["approvalRequired"] || (poll["autoApproveOwner"] && userId === poll["owner"]) },
            },
        });
        sendUpdates(pollId)
        res.status(201).json(result);
    } else {
        res.status(400).send("Error")
    }

})

router.delete("/option", async (req, res) => {
    const {pollId, userId, options} = req.body;

    const optionsToDelete = options.split(".");
    
    for (let i = 0; i < optionsToDelete.length; i++) {
        if (!ObjectId.isValid(optionsToDelete[i])) {
            res.status(400).json("Invalid Option " + optionsToDelete[i]);
            return;
        }
    }

    if (ObjectId.isValid(pollId) && ObjectId.isValid(userId)) {
        var poll = await Poll.findOne({_id: pollId})
    } else {
        res.status(401).json("Error");
        return;
    }

    if (poll && poll["owner"] === userId) {
        const result = await Poll.updateMany({_id: pollId}, {
            $pull: {
               options: {_id: {$in: optionsToDelete}},
            },
        });
        sendUpdates(pollId);
        res.status(201).json(result);
    } else {
        res.status(410).send("Error. Permission Denied.")
    }

})


router.put("/option", async (req, res) => {
    const {pollId, optionId, approved, userId} = req.body;

    if (ObjectId.isValid(pollId) && ObjectId.isValid(optionId)) {
        var poll = await Poll.findOne({_id: pollId})
    } else {
        res.status(401).json("Error");
        return;
    }

    if (poll && poll["owner"] === userId) {
        if (approved) {
            await Poll.updateOne({_id: pollId, "options._id": optionId}, {
                "options.$.approved": true
            });
        } else {
            await Poll.updateOne({_id: pollId}, {
                $pull: {
                    options: {_id: optionId},
                },
            });
        }
        
        sendUpdates(pollId);
        res.status(201).json("Request Approved");
    } else {
        res.status(400).send("Error")
    }

})



router.put("/vote", async (req, res) => {
    const {pollId, optionId, userId} = req.body;

    if (ObjectId.isValid(pollId) && ObjectId.isValid(optionId) && ObjectId.isValid(userId)) {
        var poll = await Poll.findOne({_id: pollId})
    } else {
        res.status(401).json("Error");
        return;
    }
    
    if (poll && !poll["disableVoting"]) {
        const limitOneVote = poll["limitOneVote"];
        const ids = poll["votes"]
        
        try {
            var optionIds = ids.find(option => option["userId"] === userId)["optionIds"]
            var optionIdLocation = optionIds.findIndex(element => element === optionId)
        } catch (error) {
            res.status(401).json("ID not found")
            return
        }
        
        if (optionIdLocation === -1) { //vote not found, so cast one
            if (limitOneVote && optionIds.length >= 1) {
               res.status(400).json("Limit 1 vote!")
               return;
            } else {
                //    votes: [{userId: String, optionIds: [String]}],
                await Poll.updateOne({_id: pollId, "votes.userId": userId}, {
                    $push: {
                        "votes.$.optionIds": optionId
                    }
                });
                var change = 1;
                optionIds.push(optionId)
            }
        } else { //vote found, remove it
            await Poll.updateOne({_id: pollId, "votes.userId": userId}, {
                $pull: {
                    "votes.$.optionIds": optionId
                }
            });
            change = -1;
            optionIds.splice(optionIdLocation, 1)
        }

        //    options: [{ optionTitle: String, votes: Number}],
        await Poll.updateOne({_id: pollId, "options._id": optionId}, {
            $inc: {
                "options.$.votes": change
            },
        });
        
        sendUpdates(pollId)
        res.status(201).json(optionIds);
        
    } else {
        res.status(401).json("Error. Poll not found or voting disabled.")
    }

    

})


router.put("/setting", async (req, res) => {
    const {pollId, userId, setting, newValue} = req.body;
   
    if (ObjectId.isValid(pollId) && ObjectId.isValid(userId))  
        var poll = await Poll.findOne({_id: pollId})
    else {
        res.status(400).json("Error");
        return;
    }

    if (!poll || poll["owner"] !== userId) {
        res.status(401).send("Permission Denied");    
        return;
    }

    switch (setting) {
        case "limitOneVote":
            var update = { limitOneVote: newValue }; 
            break;
        case "approvalRequired":
            update = { approvalRequired: newValue };
            break;
        case "hideVotes":
            update = { hideVotes: newValue };
            break;
        case "hideVotesForOwner":
            update = { hideVotesForOwner: newValue };
            break;
        case "disableVoting":
            update = { disableVoting: newValue };
            break;
        case "autoApproveOwner":
            update = {autoApproveOwner: newValue};
            break;
        default:
            res.status(400).send("Error");
            return;
    }

    const result = await Poll.updateOne({_id: pollId}, update);
        
    res.status(201).json(result);
    sendUpdates(pollId)
    return;


});

module.exports = router
