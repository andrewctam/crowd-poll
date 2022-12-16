export {};

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    createdAt: { type: Date, default: Date.now }
})
    
module.exports = mongoose.model("user", userSchema)