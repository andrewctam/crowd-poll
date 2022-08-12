const express = require('express')
var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")
const router = express.Router();

//hashmap where pollId -> res set. In the res set is all the res from SSE.
var connected = new Map();

const sendUpdates = async (pollId) => {
    const requests = connected.get(pollId);

    if (!requests) {
        console.log("Error. res not found");
        return;
    }

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
    console.log("User Connected")
    res.writeHead(200, {
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      });

    const id = req.params.id
   
    //see if the poll already has a set.
    if (connected.get(id)) {
        connected.get(id).add(res);
    } else {
        //create new set and add res.
        const requests = new Set();
        requests.add(res);
        connected.set(id, requests);
    } 
        
    //send a ping every 40 seconds to avoid 55 second timeout 
    const ping = setTimeout(() => {
        res.write('event: update'); 
        res.write("\n\n");   
    }, 4000)

    res.on('close', () => {
        console.log('User Disconnected');
        clearInterval(ping);
        
        if (connected.get(id).size === 1)
            connected.delete(id)
        else
            connected.get(id).delete(res);

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
            res.status(400).send("Poll expired or Invalid ID.")
        }
    } else {
        console.log(id + " is not valid")
        res.status(400).send("Poll expired or Invalid ID.")
    }

});

router.post("/create", async (req, res) => {
    const {title, owner} = req.body;
    
    if (title) {
        var poll = await Poll.create({title: title, owner: owner})
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
    const {id, optionTitle, userId} = req.body;

    if (optionTitle)
        var poll = await Poll.find({_id: id})
    else {
        res.status(400).send("Error")  
        return;
    }
    
    if (poll) {
        console.log(userId)
        console.log(poll[0]["owner"])

        if (userId == poll.owner)
            console.log("Hello");

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
    const {id, optionTitle, userId} = req.body;

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
