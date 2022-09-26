const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const User = require("../models/userModel")
const router = express.Router();

//verify user id before
router.all("*", async (req, res, next) => {
    const {userId} = req.body;
    if (userId && ObjectId.isValid(userId) && await User.exists({ _id: userId })) { //verify userId
        next();
    } else {
        res.status(404).json("Error. Invalid User Id");
    }
})


module.exports = router