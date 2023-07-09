import { ObjectId } from "mongodb";

export {};

const mongoose = require('mongoose')

export type Option = {
    _id: ObjectId
    optionTitle: string,
    votes: number,
    approved: boolean
}

export type VotedFor = {
    userId: string,
    optionIds: ObjectId[]
};

export type Poll = {
    _id: ObjectId
    title: string,
    options: Option[],
    votes: VotedFor[],
    owner: ObjectId,
    limitOneVote: boolean,
    approvalRequired: boolean,
    autoApproveOwner: boolean,
    hideVotes: boolean,
    hideVotesForOwner: boolean,
    disableVoting: boolean
}

const pollSchema = mongoose.Schema({
    title: String,
    options: [{ optionTitle: String, votes: Number, approved: Boolean}],
    votes: [{userId: ObjectId, optionIds: [ObjectId]}],
    owner: ObjectId,

    limitOneVote: { type: Boolean, default: false },
    approvalRequired: { type: Boolean, default: false },
    autoApproveOwner: { type: Boolean, default: true },
    hideVotes: { type: Boolean, default: false },
    hideVotesForOwner: { type: Boolean, default: false },
    disableVoting: { type: Boolean, default: false },
})
    
module.exports = mongoose.model("poll", pollSchema)