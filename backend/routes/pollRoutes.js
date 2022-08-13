const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const router = express.Router();

//hashmap where pollId -> res set. In the res set is all the res from SSE.
var connected = new Map();

router.get("/updates/:id", async (req, res) => {
    console.log("User Connected")
    res.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      });

    const id = req.params.id
   
    //see if the poll already has a set.
    if (connected.get(id)) {
        connected.get(id).add(res);
    } else {
        //create new set and add res.
        const requests = new Set();
        requests.add(res);
        connected.set(id, requests);
    } 
        
    //send a ping every 40 seconds to avoid 55 second timeout 
    const ping = setTimeout(() => {
        res.write('event: update'); 
        res.write("\n\n");   
    }, 4000)

    res.on('close', () => {
        console.log('User Disconnected');
        clearInterval(ping);
        
        if (connected.get(id).size === 1)
            connected.delete(id)
        else
            connected.get(id).delete(res);

        res.end();
    });

})


const sendUpdates = async (pollId) => {
    const requests = connected.get(pollId);

    if (!requests) {
        console.log("Error. Res not found");
        return;
    }

    try {
        var poll = await Poll.find({_id: pollId})
        console.log("New Update for " + pollId)
    } catch (error) {
        console.log(error);
        return;
    }

    poll = poll[0]
    const msg = {
        id: poll["_id"],
        title: poll["title"],
        options: poll["options"],
        //owner: user === poll["owner"],
        settings: {
            limitOneVote: poll["limitOneVote"],
            approvalRequired: poll["approvalRequired"]
        }
    }


    requests.forEach(res => {
        res.write('event: update\n'); 
        res.write(`data:${JSON.stringify(msg)}`)
        res.write("\n\n");   
    })
}



router.get("/:id&:user", async (req, res) => {
    const pollId = req.params.id;
    const user = req.params.user;


    if (ObjectId.isValid(pollId)) {
        try {
            var poll = await Poll.find({_id: pollId})
        } catch (error) {
            console.log(error);
            return;
        }
        
        if (poll) {

            //add votes object
            if (!await Poll.exists({_id: pollId, "votes.userId":user})) {
                await Poll.updateOne({_id: pollId}, {
                    $push: {
                        "votes": {
                            userId: user,
                            optionIds: []
                        }
                    }
                });
                var optionIds = []
            } else {
                const ids = poll[0]["votes"]
                optionIds = ids.find(option => option["userId"] === user)["optionIds"]
            }


    

            poll = poll[0]
            const msg = {
                id: poll["_id"],
                title: poll["title"],
                options: poll["options"],
                owner: user === poll["owner"],
                settings: {
                    limitOneVote: poll["limitOneVote"],
                    approvalRequired: poll["approvalRequired"]
                },
                votedFor: optionIds
            }

            res.status(201).json(msg);
        }  else {
            res.status(400).send("Poll expired or Invalid ID.")
        }
    } else {
        console.log(pollId + " is not valid")
        res.status(400).send("Poll expired or Invalid ID.")
    }

});

router.post("/create", async (req, res) => {
    const {title, owner} = req.body;
    
    if (title) {
        var poll = await Poll.create({title: title, owner: owner})
    } else {
        console.log(title)
        res.status(400).send("error enter title")
        return;
    }


    if (poll) {
        res.status(201).json({id: poll.id})
    } else {
        res.status(400).send("Error");
    }
})



router.post("/option", async (req, res) => {
    const {id, optionTitle, userId} = req.body;

    if (optionTitle)
        var poll = await Poll.find({_id: id})
    else {
        res.status(400).send("Error")  
        return;
    }
    

    if (poll) {

        const result = await Poll.updateOne({_id: id}, {
            $push: {
               options: {optionTitle: optionTitle, votes: 0},
            },
        });

        sendUpdates(id)
        res.status(201).json(result);
    } else {
        res.status(400).send("Error")
    }

})

router.delete("/option", async (req, res) => {
    const {id, userId} = req.body;

    const poll = await Poll.find({_id: id})

    if (poll) {
        const result = await Poll.updateOne({_id: id}, {
            $pull: {
               options: {_id: optionId},
            },
        });
        sendUpdates(id);
        res.status(201).json(result);
    } else {
        res.status(400).send("Error")
    }

})



router.put("/vote", async (req, res) => {
    const {id, optionId, userId} = req.body;

    const poll = await Poll.find({_id: id})
    
    if (poll) {
        const limitOneVote = poll[0]["limitOneVote"];
        const ids = poll[0]["votes"]
        
        const optionIds = ids.find(option => option["userId"] === userId)["optionIds"]
        
        const optionIdLocation = optionIds.findIndex(element => element === optionId)
        if (optionIdLocation === -1) { //vote
            if (limitOneVote && optionIds.length >= 1) {
               res.status(400).json("Limit 1 vote!")
               return;
            } else {
                //    votes: [{userId: String, optionIds: [String]}],
                await Poll.updateOne({_id: id, "votes.userId": userId}, {
                    $push: {
                        "votes.$.optionIds": optionId
                    }
                });
                var change = 1;
                optionIds.push(optionId)
            }
        } else {
            await Poll.updateOne({_id: id, "votes.userId": userId}, {
                $pull: {
                    "votes.$.optionIds": optionId
                }
            });
            change = -1;
            optionIds.splice(optionIdLocation, 1)
        }

        //    options: [{ optionTitle: String, votes: Number}],
        await Poll.updateOne({_id: id, "options._id": optionId}, {
            $inc: {
                "options.$.votes": change
            },
        });
        
        sendUpdates(id)
        res.status(201).json(optionIds);
        
    } else {
        res.status(404).send("Error. Poll not found?")
    }

    

})


router.put("/setting", async (req, res) => {
    const {pollId, userId, setting, newValue} = req.body;

    if (pollId && ObjectId.isValid(pollId))
        var poll = await Poll.find({_id: pollId})

    if (!poll || poll[0]["owner"] !== userId) {
        res.status(400).send("Permission Denied");    
        return;
    }

    switch (setting) {
        case "limitOneVote":
            var result = await Poll.updateOne({_id: pollId}, {
               limitOneVote: newValue
            });
            console.log(result)
            res.status(201).json(result);
            sendUpdates(pollId)
            return;
            
        case "approvalRequired":
            result = await Poll.updateOne({_id: pollId}, {
                approvalRequired: newValue
             });
            res.status(201).json(result);
            sendUpdates(pollId)
            return;
        default:
            res.status(400).send("Error");
            return;
    }


});

module.exports = router
