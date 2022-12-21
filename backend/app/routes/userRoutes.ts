import { Request, Response } from "express";

const express = require('express')
const User = require("../models/userModel")
const router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

router.get("/:userId", async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (userId && ObjectId.isValid(userId) && await User.exists({ _id: userId })) { //verify userId

        await User.updateOne(
            {_id: userId},
            {userView: false} //set user view to false on each reload
        )


        res.status(200).json(userId);
        return;

    } else { //no userId provided or invalid one provided or not in db, create new one
        const newUser = await User.create({});
        res.status(201).json(newUser["_id"]);
    }
});


router.put("/userView", async (req: Request, res: Response) => {
    const {userId, newValue} = req.body;

    if (userId && ObjectId.isValid(userId)) { //verify userId
        let user = await User.findOne({_id: userId})

        if (!user) {
            res.status(404).json("Error, user not found");
            return;
        }
    
        await User.updateOne(
            {_id: userId},
            {userView: newValue}
        )

        res.status(200).json("userView updated to " + newValue);
    } else {
        res.status(404).json("Error");
    }
})

module.exports = router
