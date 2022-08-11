const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const router = express.Router();

//hashmap where pollId -> res set. In the res set is all the res from SSE.
var connected = new Map();

const sendUpdates = async (pollId) => {
    const requests = connected.get(pollId);
    
    try {
        var poll = await Poll.find({_id: pollId})
        console.log("New Update for " + pollId)
    } catch (error) {
        console.log(error);
        return;
    }

    requests.forEach(res => {
        res.write('event: update\n'); 
        res.write(`data:${JSON.stringify(poll[0])}`)
        res.write("\n\n");   
    })
}

router.get("/updates/:id", async (req, res) => {
    res.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      });

    const id = req.params.id
    console.log("User Connected")
   

    //see if the poll already has a set.
    if (connected.get(id)) {
        connected.get(id).add(res);
    } else {
        //create new set and add res.
        const requests = new Set();
        requests.add(res);
        connected.set(id, requests);
    } 
        



    res.on('close', () => {
        console.log('User Disconnected');

        if (connected[id].size === 1)
            delete connected[id]
        else
            connected[id].delete(res);

        res.end();
    });

})



router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (ObjectId.isValid(id)) {
        try {
            var poll = await Poll.find({_id: id})
        } catch (error) {
            console.log(error);
            return;
        }

        if (poll) {
            res.status(201).json(poll);
        }  else {
            res.status(400).send("Enter an id")
        }
    } else {
        console.log(id + " is bad")
        res.status(400).send("Invalid id")
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
        sendUpdates(id)
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
        sendUpdates(id);
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
        sendUpdates(id)
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
        sendUpdates(id)
        res.status(201).json(result);
    } else {
        res.status(400).send("Error")
    }

})







module.exports = router