const ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const User = require("../models/userModel")
const router = require('express').Router();
import { Request, Response } from 'express';
import { UserConnection } from '../server';
import { Poll } from '../models/pollModel';

const connections = require("../server")

router.post("/create", async (req: Request, res: Response ) => {
    const {title, userId} = req.body;
    let poll: Poll | null = null;

    if (title) {
         poll = await Poll.create({title: title, owner: userId})
    } else {
        res.status(400).json("Error. Enter a title")
        return;
    }

    if (poll) {
        res.status(201).json({pollId: poll._id})
    } else {
        res.status(400).send("Error connecting to database");
    }

})

router.delete("/delete", async (req: Request, res: Response) => {
    const {pollIds, userId} = req.body;

    if (!pollIds)
        res.status(400).json("Error. No pollIds provided")

    const pollsToDelete = pollIds.split(".");
    if (!pollsToDelete) 
        res.status(410).send("Error")
    

    pollsToDelete.forEach(async (pollId: typeof ObjectId) => {
        if (ObjectId.isValid(pollId)) {
            await Poll.deleteOne({_id: pollId, owner: userId});
            
            const connectedUsers = connections.get(pollId)
            if (connectedUsers) {
                connectedUsers.forEach((user: UserConnection) => {
                    user.ws.send(JSON.stringify({"error": "Poll Deleted"}))
                    user.ws.close()
                })

                connections.delete(pollId)
            }
            
        } else {
            console.log(pollId + " is not valid");
        }
    })

    res.status(201).json("Deleted");
})

module.exports = router
