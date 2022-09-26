const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const router = express.Router();

const wsConnections = require("../server")

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
                
                const connectedUsers = wsConnections.get(pollId)
                if (connectedUsers) {
                    connectedUsers.forEach((user) => {
                        user.ws.send(JSON.stringify({"error": "Poll Deleted"}))
                        user.ws.close()
                    })

                    wsConnections.delete(pollId)
                }

             
            } else {
                console.log(pollId + " is not valid");
            }
        })

        res.status(201).json("Deleted");
    } else {
        res.status(410).send("Error. Permission Denied.")
    }

})

module.exports = router
