var ObjectId = require('mongoose').Types.ObjectId;
const Poll = require("../models/pollModel")

const wsConnections = require("../server")

const sendUpdatedPoll = async (pollId) => {
    console.log(wsConnections)
    const connectedUsers = wsConnections.get(pollId);

    connectedUsers.forEach( async (user) => {
        user["ws"].send(await getPoll(user["userId"], pollId))
    });
}

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
        update: "true",
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
        console.log(optionTitle + " " + pollId + " " + userId)
        return JSON.stringify({"error" : "Invalid Inputs"})
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
    
    sendUpdatedPoll(pollId);
    return JSON.stringify(result)
}

const deleteOption = async (userId, pollId, optionsToDelete) => {
    for (let i = 0; i < optionsToDelete.length; i++) {
        if (!ObjectId.isValid(optionsToDelete[i]))
            return JSON.stringify({"error" : "Invalid: " + optionsToDelete[i]})
    }

    if (ObjectId.isValid(pollId) && ObjectId.isValid(userId)) {
        var poll = await Poll.findOne({_id: pollId})
    } else {
        return JSON.stringify({"error": "ID invalid"})
    }


    if (poll && poll["owner"] === userId) {
        const result = await Poll.updateMany({_id: pollId}, {
            $pull: {
               options: {_id: {$in: optionsToDelete}},
            },
        });
        sendUpdatedPoll(pollId);
        return JSON.stringify(result)
    } else {
        return JSON.stringify({"error": "Permission Denied"})
    }
}    

const approveDenyOption = async (userId, pollId, optionId, approved) => {

    if (ObjectId.isValid(pollId) && ObjectId.isValid(optionId)) {
        var poll = await Poll.findOne({_id: pollId})
    } else {
        return JSON.stringify({"error": "ID invalid"})
    }

    if (poll && poll["owner"] === userId) {
        if (approved) {
            await Poll.updateOne({_id: pollId, "options._id": optionId}, {
                "options.$.approved": true
            });
        } else {
            await Poll.updateOne({_id: pollId}, {
                $pull: {
                    options: {_id: optionId},
                },
            });
        }
        
        sendUpdatedPoll(pollId);
        return JSON.stringify({"success": "Request Processed"})
    } else {
        return JSON.stringify({"error": "Permission Denied"})
    }
}

const vote = async (userId, pollId, optionId) => {
    if (ObjectId.isValid(pollId) && ObjectId.isValid(optionId) && ObjectId.isValid(userId)) {
        var poll = await Poll.findOne({_id: pollId})
    } else {
        return JSON.stringify({"error": "ID invalid"})
    }
    
    if (!poll || poll["disableVoting"]) {
        return JSON.stringify({"error": "No Voting Allowed"})
    }

    const limitOneVote = poll["limitOneVote"];
    const ids = poll["votes"]
    
    try {
        var optionIds = ids.find(option => option["userId"] === userId)["optionIds"]
        var optionIdLocation = optionIds.findIndex(element => element === optionId)
    } catch (error) {
        return JSON.stringify({"error": "Invalid ID"})
    }
    
    if (optionIdLocation === -1) { //vote not found, so cast one
        if (limitOneVote && optionIds.length >= 1) {
            return JSON.stringify({"error": "Limit One Vote"})
        } else {
            //    votes: [{userId: String, optionIds: [String]}],
            await Poll.updateOne({_id: pollId, "votes.userId": userId}, {
                $push: {
                    "votes.$.optionIds": optionId
                }
            });
            var change = 1;
            optionIds.push(optionId)
        }
    } else { //vote found, remove it
        await Poll.updateOne({_id: pollId, "votes.userId": userId}, {
            $pull: {
                "votes.$.optionIds": optionId
            }
        });
        change = -1;
        optionIds.splice(optionIdLocation, 1)
    }


    //    options: [{ optionTitle: String, votes: Number}],
    await Poll.updateOne({_id: pollId, "options._id": optionId}, {
        $inc: {
            "options.$.votes": change
        },
    });
    
    sendUpdatedPoll(pollId)
    return JSON.stringify({
        "votedFor" : optionIds
    });
    
}

const updateSetting = async (userId, pollId, setting, newValue) => {   
    if (ObjectId.isValid(pollId) && ObjectId.isValid(userId))  
        var poll = await Poll.findOne({_id: pollId})
    else {
        return JSON.stringify({"error" : "Invalid Inputs"})
    }

    if (!poll || poll["owner"] !== userId) {
        return JSON.stringify({"error" : "Permission Denied"})
    }

    switch (setting) {
        case "limitOneVote":
            var update = { limitOneVote: newValue }; 
            break;
        case "approvalRequired":
            update = { approvalRequired: newValue };
            break;
        case "hideVotes":
            update = { hideVotes: newValue };
            break;
        case "hideVotesForOwner":
            update = { hideVotesForOwner: newValue };
            break;
        case "disableVoting":
            update = { disableVoting: newValue };
            break;
        case "autoApproveOwner":
            update = {autoApproveOwner: newValue};
            break;
        default:
            return JSON.stringify({"error" : "Invalid Setting"})
    }

    const result = await Poll.updateOne({_id: pollId}, update);
    sendUpdatedPoll(pollId)

    return JSON.stringify(result)
}



module.exports = {getPoll, addOption, sendUpdatedPoll, deleteOption, approveDenyOption, vote, updateSetting}