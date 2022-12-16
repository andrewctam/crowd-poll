export {};

const mongoose = require('mongoose')

export type Option = {
    optionTitle: string,
    votes: number,
    approved: boolean
}

export type VotedFor = {
    userId: string,
    optionIds: [string]
};

export type Poll = {
    title: string,
    options: [Option],
    votes: [VotedFor],
    owner: string,
    limitOneVote: boolean,
    approvalRequired: boolean,
    autoApproveOwner: boolean,
    hideVotes: boolean,
    hideVotesForOwner: boolean,
    disableVoting: boolean
}
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