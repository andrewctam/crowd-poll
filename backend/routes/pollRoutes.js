const express = require('express')
const Poll = require("../models/pollModel")

const router = express.Router();

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        var poll = await Poll.find({_id: id})
    } catch (error) {
        console.log(error);
        return;
    }

    if (poll) {
        res.status(201).json(poll);
    } else {
        res.status(400).send("Enter an id")
    }


});


router.post("/create", async (req, res) => {
    const {title} = req.body;

    if (title) {
        var poll = await Poll.create({title: title})
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
    const {id, optionTitle} = req.body;
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
        res.status(201).json(result);
    } else {
        res.status(400).send("Error")
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
        res.status(400).send("Error")
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
        res.status(400).send("Error")
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
        res.status(400).send("Error")
    }

})






module.exports = router