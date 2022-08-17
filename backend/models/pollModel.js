const mongoose = require('mongoose')

const pollSchema = mongoose.Schema({
    title: String,
    options:[{ optionTitle: String, votes: Number, approved: Boolean}],
    votes: [{userId: String, optionIds: [String]}],
    owner: String,

    limitOneVote: { type: Boolean, default: false },
    approvalRequired: { type: Boolean, default: false },
    autoApproveOwner: { type: Boolean, default: true },
    hideVotes: { type: Boolean, default: false },
    hideVotesForOwner: { type: Boolean, default: false },
    disableVoting: { type: Boolean, default: false },
    
    
})
    
module.exports = mongoose.model("poll", pollSchema)