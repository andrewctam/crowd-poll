import "./index.css"
import { useState, useEffect, useRef } from "react";
import Poll from "./poll/Poll"
import Welcome from "./welcome/Welcome";

import { BrowserRouter, Route, Routes} from "react-router-dom";
  
import { w3cwebsocket as W3CWebSocket } from "websocket";
import useAlert from "./hooks/useAlert";
import PollLoading from "./welcome/PollLoading";

function App() {
	const [pollData, setPollData] = useState(null);

	const [pollId, setPollId] = useState("")
	const [userId, setUserId] = useState("")

	const pingRef = useRef<NodeJS.Timer | null>(null);
	const wsRef = useRef<W3CWebSocket | null>(null);

	const [alerts, addAlert] = useAlert();

	const verifyId = async () => {
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
			addAlert("Failed to connect to server. Please try again in a moment", 10000, "error");
			return;
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
		if (pingRef.current)
			clearInterval(pingRef.current)

		if (pollId && userId)
			getPoll()
		else {
			setPollData(null)
			wsRef.current = null;
		}

		// eslint-disable-next-line
	}, [pollId, userId])

	const getPoll = async () => {
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
		}

		ws.onerror = (error) => {
			addAlert("Failed to connect to server. Please refresh and try again", 10000, "error");
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
						addAlert("Poll Deleted or Does Not Exist", 10000, "error");
						setPollId("")
						break;

					case "Invalid User ID":
						addAlert("User ID Invalid", 10000, "error");
						verifyId();
						break;
					case "Permission Denied":
						addAlert("Permission Denied, Not Owner.", 10000, "error");
						break;
					case "Poll Deleted":
						addAlert("Poll Was Deleted", 10000, "error");
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
				addAlert("Connection to server lost. Trying to reconnect...", 5000, "error");
				getPoll(); //retry to connect
			} else {
				ws.send(JSON.stringify({"type": "ping"}))
			}
		}, 5000)
		
		pingRef.current = ping;
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
					addAlert = {addAlert}  
				/>}
			/>
			
			<Route path = "/poll" element = {
				pollData && wsRef && wsRef.current ?
					<Poll pollId={pollData["pollId"]}
					title={pollData["title"]}
					options={pollData["options"]}
					settings={pollData["settings"]}
					isOwner={pollData["owner"]}
					votedFor={pollData["votedFor"]}
					userId={userId}
					ws={wsRef.current}
					/> 
				: 
					<PollLoading addAlert = {addAlert}/>}
			/>
		</Routes>
		
	</BrowserRouter>
	</>)

}

export default App;
