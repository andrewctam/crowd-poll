const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const router = express.Router();


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
