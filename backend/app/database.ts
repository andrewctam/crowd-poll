const mongoose = require('mongoose')

const connectMongoDB = async () => {
    try {
        const connect = await(mongoose.connect(process.env.MONGO_URI)) //set environmental variable
        console.log(`Connected to ${connect.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
 }

 module.exports = connectMongoDB