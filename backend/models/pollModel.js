const mongoose = require('mongoose')

const pollSchema = mongoose.Schema({
    title: String,
    options:[{ optionTitle: String, votes: Number}],
    owner: String,

    limitOneVote: { type: Boolean, default: false },
    approvalRequired: { type: Boolean, default: false },
})
    
module.exports = mongoose.model("poll", pollSchema)