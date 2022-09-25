//comment out below when uploading
require('dotenv').config()

const express = require('express');
const cors = require('cors');

const connectMongoDB = require("./database");
connectMongoDB();

const port = process.env.PORT || 6000

//express server
const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use("/api/polls", require("./routes/pollRoutes"))
app.use("/api/users", require("./routes/userRoutes"))
const expressServer = app.listen(port, () => {console.log(`Server started on port ${port}`)})


//websocket server
const server = require("ws")
const wss = new server.Server({server: expressServer})

const getPoll = require("./routes/poll").getPoll
const addOption = require("./routes/poll").addOption

const connected = new Map()
wss.on("connection", async (ws, req) => {
    ws.on("message", async message => {
        const data = JSON.parse(message)
        console.log(data)
        
        const pollId = data.pollId
        const userId = data.userId
        const type = data.type
        
        switch(type) {
            case "getPoll":
                ws.send(getPoll(userId, pollId))
                break;
            case "addOption":
                const option = data.option
                ws.send(addOption(userId, pollId, option))
                break;
        }
        
    })

    const params = new URLSearchParams(req.url.slice(1))
    const pollId = params.get("poll")
    const userId = params.get("user")
    connected.set(pollId, ws)
    
    ws.send(await getPoll(userId, pollId))
})
