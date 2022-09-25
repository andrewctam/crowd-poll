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
app.use("/api/users", require("./routes/userRoutes"))
app.use("/api/polls", require("./routes/pollRoutes"))
const expressServer = app.listen(port, () => {console.log(`Server started on port ${port}`)})


//websocket server
const server = require("ws")
const wss = new server.Server({server: expressServer})

//maps pollIds to set of user objects
const wsConnections = new Map()
module.exports = wsConnections

const pings = new Map();

const pollFuncs = require("./routes/poll")
wss.on("connection", async (ws, req) => {
    ws.on("message", async message => {
        const data = JSON.parse(message)
        
        const type = data.type
        const pollId = data.pollId
        const userId = data.userId

        switch(type) {
            case "ping":
                console.log("ping")
                const clear = pings.get(ws)
                
                if (clear["timeout"]) {
                    clearTimeout(clear["timeout"])
                    pings.set(ws, {
                        "timeout": setTimeout(clear["deleteUser"], 10000),
                        "deleteUser": clear["deleteUser"]
                    })

                }


                ws.send(JSON.stringify({type: "pong"}))
                break;
            case "getPoll":
                ws.send(await pollFuncs.getPoll(userId, pollId))
                break;
            case "addOption":
                ws.send(await pollFuncs.addOption(userId, pollId, data.optionTitle))
                break;
            case "deleteOption":
                ws.send(await pollFuncs.deleteOption(userId, pollId, data.optionId))
                break;
            case "vote":
                ws.send(await pollFuncs.vote(userId, pollId, data.optionId))
                break;
            case "approveDenyOption":
                ws.send(await pollFuncs.approveDenyOption(userId, pollId, data.optionId, data.approve))
                break;
            case "updateSetting":
                ws.send(await pollFuncs.updateSetting(userId, pollId, data.setting, data.value))
                break;
            case "disconnect":
                
            default: 
                ws.send(JSON.stringify({"error": "Invalid request"}))
        }

        console.log(wsConnections)
        
    })

    console.log("User Connected")
    const params = new URLSearchParams(req.url.slice(1))
    const pollId = params.get("poll")
    const userId = params.get("user")

    const user = {
        "ws": ws, 
        "userId": userId
    } 
    

    var usersSet = wsConnections.get(pollId)
    if (!usersSet) {
        usersSet = new Set()
        wsConnections.set(pollId, usersSet)
    }
    
    usersSet.add(user)

    const deleteUser = () => {
        usersSet.delete(user)
        ws.close();
        console.log("User Not Responding. Deleted.")
    }

    pings.set(ws, {
        "timeout": setTimeout(deleteUser, 10000),
        "deleteUser": deleteUser
    })


    ws.send(await pollFuncs.getPoll(userId, pollId))
})
