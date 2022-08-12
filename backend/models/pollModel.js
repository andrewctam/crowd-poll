const mongoose = require('mongoose')

const pollSchema = mongoose.Schema({
    title: String,
    options:[{ optionTitle: String, votes: Number}],
    owner: String
})
    
module.exports = mongoose.model("poll", pollSchema)