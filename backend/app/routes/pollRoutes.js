const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const User = require("../models/userModel")
const router = express.Router();

const wsConnections = require("../server")

router.post("/create", async (req, res) => {
    const {title, userId} = req.body;
    
    if (title) {
        var poll = await Poll.create({title: title, owner: userId})
    } else {
        res.status(400).json("Error. Enter a title")
        return;
    }

    if (poll) {
        res.status(201).json({pollId: poll.id})
    } else {
        res.status(400).send("Error connecting to database");
    }

})

router.delete("/delete", async (req, res) => {
    const {pollIds, userId} = req.body;

    const pollsToDelete = pollIds.split(".");

    if (pollsToDelete) {
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
