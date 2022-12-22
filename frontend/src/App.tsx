import "./index.css"
import { useState, useEffect, useRef } from "react";
import Poll from "./poll/Poll"
import Welcome from "./welcome/Welcome";

import { BrowserRouter, Route, Routes} from "react-router-dom";
import { w3cwebsocket as W3CWebSocket } from "websocket";

import useAlert from "./hooks/useAlert";
import PollLoading from "./welcome/PollLoading";

export interface PollSettings {
    hideVotes: boolean
    hideVotesForOwner: boolean
    approvalRequired: boolean
    autoApproveOwner: boolean
    disableVoting: boolean
    limitOneVote: boolean
}

export type OptionData = {
    approved: boolean
    optionTitle: string
    votes: number
    _id: string
}

export interface PollData {
    pollId: string
    userId: string
    title: string
    isOwner: boolean
    votedFor: string[]
    settings: PollSettings
    options: OptionData[]
}

function App() {
	const [pollData, setPollData] = useState<PollData | null> (null);

	const [pollId, setPollId] = useState("")
	const [userId, setUserId] = useState("")

	const pingIntervalRef = useRef<NodeJS.Timer | null>(null);
	const wsRef = useRef<W3CWebSocket | null>(null);

	const [alerts, alertDispatch] = useAlert();

	const verifyId = async (retrying = false) => {
		let storedUserId = "";

		if (userId !== "") {
			storedUserId = userId
		} else {
			storedUserId = localStorage.getItem("userId") ?? "null"
		}

		//verify that the user id is in the database
		const url = `${process.env.NODE_ENV !== "production" ? process.env.REACT_APP_DEV_HTTP_URL : process.env.REACT_APP_PROD_HTTP_URL}/api/users/${storedUserId}`
		const message = await fetch(url)
			.then(response => response.json())	
			.catch((error) => {
				console.log(error);
				return null;
			});

		if (!message) { //error
			alertDispatch({type: "ADD_ALERT", payload: {
				msg: "Can not connect to server. Trying to connect...",
				time: 1000,
				type: "error"
			}})

			setTimeout(() => { verifyId(true) }, 1100);
			return;
		} else if (retrying) {
			alertDispatch({type: "ADD_ALERT", payload: {
				msg: "Successfully connected",
				time: 1000,
				type: "success"
			}})
		}

		localStorage.setItem("userId", message)
		setUserId(message);
	
		if (storedUserId === message) //user id found in db, no change
			console.log("R " + storedUserId)
		else { //new user id created, either none provided or invalid one provided
			console.log("N " + message)
			localStorage.removeItem("created") //remove created matrices since userId changed
		}

	}

	useEffect(() => {
		verifyId();

		const idParam = new URLSearchParams(window.location.search).get("id")
		if (idParam)
			setPollId(idParam);
			
		// eslint-disable-next-line
	}, [])

	useEffect(() => {
		if (pingIntervalRef.current)
			clearInterval(pingIntervalRef.current)

		if (pollId && userId)
			getPoll()
		else {
			setPollData(null)
			wsRef.current = null;
		}

		// eslint-disable-next-line
	}, [pollId, userId])

	const getPoll = async (reconnecting = false) => {
		if (!pollId) {
			return false;
		}  
		
		//open a websocket connection to communicate with the server
		const url = `${process.env.NODE_ENV !== "production" ? process.env.REACT_APP_DEV_WS_URL : process.env.REACT_APP_PROD_WS_URL}?poll=${pollId}&user=${userId}`
		const ws = new W3CWebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log("Successfully Connected to Server")
			console.log(ws)

			if (reconnecting) {
				alertDispatch({type: "REMOVE_ALERT_BY_MSG", payload: {
					msg: "Connection to server lost. Trying to reconnect..."
				}})

				
				alertDispatch({type: "ADD_ALERT", payload: {
					msg: "Successfully reconnected",
					time: 1000,
					type: "success"
				}})
			}

		}

		ws.onerror = (error) => {
			console.log(error)
			ws.close();
		}

		ws.onmessage = (message) => {
			const data = JSON.parse(message.data.toString())
			console.log(data)
			
			//catch any errors. server will only send an "error" in data if there is an error
			if (data["error"]) {
				switch (data["error"]) {
					case "Invalid Poll ID":
						alertDispatch({type: "ADD_ALERT", payload: {
							msg: "Poll Deleted or Does Not Exist",
							time: 10000,
							type: "error"
						}})
						setPollId("")
						break;

					case "Invalid User ID":
						alertDispatch({type: "ADD_ALERT", payload: {
							msg: "User ID Invalid",
							time: 10000,
							type: "error"
						}})
						verifyId();
						break;
					case "Permission Denied":
						alertDispatch({type: "ADD_ALERT", payload: {
							msg: "Permission Denied, Not Owner.",
							time: 10000,
							type: "error"
							}})

						break;
					case "Poll Deleted":
						alertDispatch({type: "ADD_ALERT", payload: {
							msg: "Poll Was Deleted",
							time: 10000,
							type: "error"
							}})
						setPollId("")
						break;
					default: //other kind of error, no need to handle
						console.log(data["error"])
						break;
				}
				return;
			}

			
			//server will only send update if there is an "update" in data
			if (data["update"]) {
				setPollData(data)
			}

		}

		//ping server every 5 seconds to avoid being removed from ws connections
		const ping = setInterval(() => {
			if (ws.readyState === ws.CLOSED) {
				clearInterval(ping)
				alertDispatch({type: "ADD_ALERT", payload: {
					msg: "Connection to server lost. Trying to reconnect...",
					time: 4500,
					type: "error"
				}})

				getPoll(true); //retry to connect
			} else {
				ws.send(JSON.stringify({"type": "ping"}))
			}
		}, 5000)
		
		pingIntervalRef.current = ping;
	}

	return (
	<>
	{alerts}
	<BrowserRouter>
		<Routes>
			<Route path = "/" element = {
				<Welcome 
					setPollId={setPollId}
					userId={userId}
					verifyId = {verifyId}
					alertDispatch = {alertDispatch}  
				/>}
			/>
			
			<Route path = "/poll" element = {
				pollData && wsRef && wsRef.current ?
					<Poll
						alertDispatch={alertDispatch}
						pollId={pollData["pollId"]}
						title={pollData["title"]}
						options={pollData["options"]}
						settings={pollData["settings"]}
						isOwner={pollData["isOwner"]}
						votedFor={pollData["votedFor"]}
						userId={userId}
						ws={wsRef.current}
					/> 
				: 
					<PollLoading dispatch = {alertDispatch}/>}
			/>
		</Routes>
	</BrowserRouter>
	</>
	)

}

export default App;
