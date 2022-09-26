const express = require('express')
const User = require("../models/userModel")
const router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;

    if (userId && ObjectId.isValid(userId) && await User.exists({ _id: userId })) { //verify userId
        res.status(200).json(userId);
        return;

    } else { //no userId provided or invalid one provided or not in db, create new one
        const newUser = await User.create({});
        res.status(201).json(newUser["_id"]);
    }
});


module.exports = router
