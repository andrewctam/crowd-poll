const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const User = require("../models/userModel")
const router = express.Router();


router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;

    if (userId && ObjectId.isValid(userId)) {
        const idExists = await User.exists({ _id: userId });
        if (idExists) {
            res.status(200).json("User Exists");
            return;
        }
    }

    const newId = await User.create({});
    res.status(404).json(newId);
});


router.get("/", async (req, res) => {
    const newId = await User.create({});
    res.status(200).json(newId);
});



module.exports = router
