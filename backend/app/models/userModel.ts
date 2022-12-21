export {};

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    userView: {type: Boolean, default: false}, //even if owner, get what a user sees. will get set to false whenever the user reloads the page
    createdAt: { type: Date, default: Date.now }
})
    
module.exports = mongoose.model("user", userSchema)