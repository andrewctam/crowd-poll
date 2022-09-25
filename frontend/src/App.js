import "./index.css"
import { useState, useEffect } from "react";
import Poll from "./Poll"
import Welcome from "./Welcome";
import Alert from "./misc/Alert";
import { w3cwebsocket as W3CWebSocket } from "websocket";

function App(props) {
	const [poll, setPoll] = useState(null);
	const [alert, setAlert] = useState(null);

	const [pollId, setPollId] = useState("")
	const [userId, setUserId] = useState("")
	const [loaded, setLoaded] = useState(false)

	const verifyId = async () => {
		var storedUserId = localStorage.getItem("userId")
		if (storedUserId) {
			//verify that the user id is in the database
			const message = await fetch(`http://localhost:5001/api/users/${storedUserId}`)
				.then((response) => {
					if (response.status === 404)
						return response.json();

					else
						return null; //null means found
				}).catch( (error) => {
					setAlert(<Alert timeout = {100000} title = {"Connection Error"} message = {"Failed to connect to server. Please try again in a moment"} setAlert = {setAlert}/>)
					console.log(error)
					return -1;
				});
				
			if (message === -1) 
				return;
			else if (message) { //new id generated
				storedUserId = message["_id"]

				console.log("NF. N " + storedUserId)
				localStorage.setItem("userId", storedUserId)
				localStorage.removeItem("created")
			} else { //userFound
				console.log("R " + storedUserId)
			}

		} else {
			const message = await fetch("http://localhost:5001/api/users/")
				.then((response) => response.json())
			storedUserId = message["_id"]
				
			localStorage.removeItem("created")
			localStorage.setItem("userId", storedUserId)
			console.log("N " + storedUserId)	
		}

		setUserId(storedUserId);
	}

	useEffect(() => {
		verifyId();

		const idParam = new URLSearchParams(window.location.search).get("poll")
		if (idParam)
			setPollId(idParam);
		else
			setLoaded(true);

	}, [])

	useEffect(() => {
		if (pollId && userId)
			getPoll()
		
	// eslint-disable-next-line
	}, [pollId, userId])

	const getPoll = async () => {
		if (!pollId) {
			setLoaded(true)
			return;
		}

		const client = new W3CWebSocket(`ws://localhost:5001?poll=${pollId}&user=${userId}`);

		client.onopen = () => {
			console.log("Successfully Connected")
		}

		client.onerror = (error) => {
			setAlert(<Alert timeout = {10000} title = {"Error connecting to server"} message = {"Please try again in a moment"} setAlert = {setAlert}/>)
			console.log(error)
		}

		client.onmessage = (message) => {
			const data = JSON.parse(message.data)
			console.log(data)

			if (data["error"]) {
				switch(data["error"]) {
					case "Invalid Poll ID":
						setAlert(<Alert timeout = {10000} title = {"Error"} message = {"Poll Deleted or Does Not Exist"} setAlert = {setAlert}/>)
						setPollId(null)
						setLoaded(true);
						break;

					case "Invalid User ID":
						setAlert(<Alert timeout = {10000} title = {"Error"} message = {"UserID Invalid"} setAlert = {setAlert}/>)
						verifyId();
						break;

					default: 
						console.log(data["error"])
						break;
				}
				return;
			}

			if (data["update"]) {
				//update poll with data from server
				setPoll(<Poll pollId={data["pollId"]}
								title={data["title"]}
								options={data["options"]}
								settings = {data["settings"]}
								isOwner = {data["owner"]}
								votedFor = {data["votedFor"]}
								userId = {userId}
								ws = {client}
							/>)
			} 
			
		}
		
		document.addEventListener("beforeunload", () => {
			client.send(JSON.stringify({"type" : "Disconnect"}))
		})

		setInterval(() => {
			client.send(JSON.stringify({"type" : "ping"}))
		}, 5000)

		setLoaded(true)
	}


	return(
	loaded ? 
	<> 
		{alert}
		{poll ? poll : <Welcome setPollId={setPollId} userId = {userId}/>}
	</>	
	: null)

}

export default App;
