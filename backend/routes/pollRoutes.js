const e = require('express');
const express = require('express')
const Poll = require("../models/pollModel")

const router = express.Router();

router.get("/:id", async (req, res) => {
    const id = router.params.id

    const poll = await Poll.findOne({id})

    if (poll) {
        res.status(200).json(poll)
    }
});


router.post("/create", async (req, res) => {
    const {title} = req.body;

    const poll = await Poll.create({title: title})

    if (poll) {
        res.status(201).json({_id: poll.id})
    } else {
        res.status(400);
        throw new Error("Error?")
    }
})

router.post("/option", async (req, res) => {
    const {id, option} = req.body;

    const poll = await Poll.find({_id: id})

    if (poll) {
        const updateDocument = {
            $push: {
               options: {body: option, votes: 0},
            },
        };

        const result = await Poll.updateOne({_id: id}, updateDocument);
        res.status(201).json(result);
    } else {
        res.status(400)
        throw new Error("Error")
    }

})

router.delete("/option", async (req, res) => {
    const {id, optionId} = req.body;

    const poll = await Poll.find({_id: id})

    if (poll) {
        const result = await Poll.updateOne({_id: id}, {
            $pull: {
               options: {_id: optionId},
            },
        });

        res.status(201).json(result);
    } else {
        res.status(400)
        throw new Error("Error")
    }

})

router.put("/vote", async (req, res) => {
    const {id, optionId} = req.body;

    const poll = await Poll.find({_id: id})
    if (poll) {
        const result = await Poll.updateOne({_id: id, "options._id": optionId}, {
            $inc: {
               "options.$.votes": 1
            },
        });
        
        res.status(201).json(result);
    } else {
        res.status(400)
        throw new Error("Error")
    }

})

router.delete("/vote", async (req, res) => {
    const {id, optionId} = req.body;

    const poll = await Poll.find({_id: id})
    if (poll) {
        const result = await Poll.updateOne({_id: id, "options._id": optionId}, {
            $inc: {
               "options.$.votes": -1
            },
        });
        
        res.status(201).json(result);
    } else {
        res.status(400)
        throw new Error("Error")
    }

})






module.exports = router