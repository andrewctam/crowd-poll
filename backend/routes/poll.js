var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")


const getPoll = async (userId, pollId) => {
    if (!ObjectId.isValid(pollId)) {
        return JSON.stringify({error: "Invalid Poll ID"})
    }

    if (!ObjectId.isValid(userId)) {
        return JSON.stringify({error: "Invalid User ID"})
    }

    var poll = await Poll.findOne({_id: pollId})    
    if (!poll) {
        return JSON.stringify({error: "Poll expired or Invalid ID."})
    }

    //add votes object
    if (!await Poll.exists({_id: pollId, "votes.userId": userId})) {
        await Poll.updateOne({_id: pollId}, {
            $push: {
                "votes": {
                    userId: userId,
                    optionIds: []
                }
            }
        });
        var optionIds = []
    } else {
        const ids = poll["votes"]
        optionIds = ids.find(option => option["userId"] === userId)["optionIds"]
    }


    const isOwner = userId === poll["owner"]
    var options = poll["options"]

    if (isOwner) {
        if (poll["hideVotes"] && poll["hideVotesForOwner"])
            options.forEach(option => option["votes"] = -1)

    } else {
        if (poll['approvalRequired'])
            options = options.filter(element => element["approved"])
    
        if (poll['hideVotes']) {
            options.forEach(option => option["votes"] = - 1)
        }
    }
        
    const msg = {
        pollId: poll["_id"],
        title: poll["title"],
        options: options,
        owner: isOwner,
        settings: {
            limitOneVote: poll["limitOneVote"],
            approvalRequired: poll["approvalRequired"],
            autoApproveOwner: poll["autoApproveOwner"],
            hideVotes: poll["hideVotes"],
            disableVoting: poll["disableVoting"],
            hideVotesForOwner: poll["hideVotesForOwner"],
        },
        votedFor: optionIds
    }

    return JSON.stringify(msg)

    
}


const addOption = async (userId, pollId, optionTitle) => {
    if (optionTitle && ObjectId.isValid(pollId) && ObjectId.isValid(userId))
        var poll = await Poll.findOne({_id: pollId})
    else {
        return JSON.stringify({"error" : "Invalid Inputs"})
        return;
    }
    
    if (!poll) {
        return JSON.stringify({"error" : "Poll Invalid"})
    }

    const result = await Poll.updateOne({_id: pollId}, {
        $push: {
            options: {
                optionTitle: optionTitle, 
                votes: 0,
                approved: !poll["approvalRequired"] || (poll["autoApproveOwner"] && userId === poll["owner"]) },
        },
    });

    return JSON.stringify(result)

}

module.exports = getPoll, addOption