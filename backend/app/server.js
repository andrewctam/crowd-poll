if (process.env.NODE_ENV !== 'production')
    require('dotenv').config()

const port = process.env.PORT || 6000

const connectMongoDB = require("./database");
connectMongoDB();

//maps poll ids to a set containing ws user info
//Map(1) {{POLLID} => Set(1) { { ws: [WebSocket], userId: {USERID} } }}
const wsConnections = new Map()
module.exports = wsConnections

//maps ws to info for deleing a user from wsConnections if they don't ping
const pings = new Map();

//express server
const express = require('express');
const cors = require('cors');
const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use("/api/users", require("./routes/userRoutes"))

app.use("/api/polls", require("./middleware/pollMiddleware"))
app.use("/api/polls", require("./routes/pollRoutes"))
const expressServer = app.listen(port, () => {console.log(`Server started on port ${port}`)})


//websocket server
const server = require("ws")
const wss = new server.Server({server: expressServer})

const pollFunctions = require("./pollFunctions")
wss.on("connection", async (ws, req) => {
    ws.on("message", async message => {
        const data = JSON.parse(message)
        const type = data.type
        const pollId = data.pollId
        const userId = data.userId

        switch(type) {
            case "ping":
                const infoForReset = pings.get(ws)
                
                if (infoForReset) {
                    clearTimeout(infoForReset["timeout"])//cancel timeout

                    pings.set(ws, {
                        "timeout": setTimeout(infoForReset["deleteUser"], 10000), //reset timeout
                        "deleteUser": infoForReset["deleteUser"]
                    })
                    
                    ws.send(JSON.stringify({"pong": "pong"}))
                } else {
                    ws.send(JSON.stringify({"error": "No ping info. What happened?"}))
                    ws.close();
                }

                break;
            case "getPoll":
                ws.send(await pollFunctions.getPoll(userId, pollId))
                break;
            case "addOption":
                ws.send(await pollFunctions.addOption(userId, pollId, data.optionTitle))
                break;
            case "deleteOptions":
                ws.send(await pollFunctions.deleteOptions(userId, pollId, data.optionsToDelete.split(".")))
                break;
            case "vote":
                ws.send(await pollFunctions.vote(userId, pollId, data.optionId))
                break;
            case "approveDenyOption":
                ws.send(await pollFunctions.approveDenyOption(userId, pollId, data.optionId, data.approved))
                break;
            case "updateSetting":
                ws.send(await pollFunctions.updateSetting(userId, pollId, data.setting, data.newValue))
                break;

            default: 
                ws.send(JSON.stringify({"error": "Invalid request:" + type}))
        }

        
    })

    const params = new URLSearchParams(req.url.slice(1))
    const pollId = params.get("poll")
    const userId = params.get("user")

    const initial = await pollFunctions.getPoll(userId, pollId)
    ws.send(initial)

    //if there is an error {"error": ... } in the initial get, terminate the ws
    if (initial.substring(2, 7) === "error") {
        ws.close();
        return;
    }

    console.log("User " + userId + " connected to poll " + pollId)
    const user = {
        "ws": ws, 
        "userId": userId
    } 

    //add use to poll's set of current connections
    var connectedToPoll = wsConnections.get(pollId)
    if (!connectedToPoll) {
        connectedToPoll = new Set()
        wsConnections.set(pollId, connectedToPoll)
    }
    
    connectedToPoll.add(user)

    //function to remove user from connected users
    const deleteUser = () => {
        connectedToPoll.delete(user)

        if (connectedToPoll.size == 0) {
            wsConnections.delete(pollId)
        }
        
        ws.close();
        console.log("User Not Responding. Disconnecting user " + userId + " from poll " + pollId)
    }

    pings.set(ws, {
        "timeout": setTimeout(deleteUser, 11000), //delete user if no ping in 11 seconds. They should send a ping every 5 seconds
        "deleteUser": deleteUser //function to delete user. used for resetting timeout after ping
    })
    
})
