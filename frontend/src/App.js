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

	const verifyId = async () => {
		var storedUserId = localStorage.getItem("userId")
		if (storedUserId) {
			//verify that the user id is in the database
			const message = await fetch(`https://crowdpoll.fly.dev/api/users/${storedUserId}`)
				.then((response) => {
					if (response.status === 404)
						return response.json();
					else
						return null; //null means found
				}).catch((error) => {
					setAlert(<Alert timeout={10000} title={"Connection Error"} message={"Failed to connect to server. Please try again in a moment"} setAlert={setAlert} />)
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
			const message = await fetch("https://crowdpoll.fly.dev/api/users/")
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

	}, [])

	useEffect(() => {
		if (pollId && userId)
			getPoll()

		// eslint-disable-next-line
	}, [pollId, userId])

	const getPoll = async () => {
		if (!pollId) {
			return;
		}

		const client = new W3CWebSocket(`wss://crowdpoll.fly.dev?poll=${pollId}&user=${userId}`);

		client.onopen = () => {
			console.log("Successfully Connected")
		}

		client.onerror = (error) => {
			setAlert(<Alert timeout={10000} title={"Error connecting to server"} message={"Please try again in a moment"} setAlert={setAlert} />)
			console.log(error)
		}

		client.onmessage = (message) => {
			const data = JSON.parse(message.data)
			console.log(data)

			if (data["error"]) {
				switch (data["error"]) {
					case "Invalid Poll ID":
						setAlert(<Alert timeout={10000} title={"Error"} message={"Poll Deleted or Does Not Exist"} setAlert={setAlert} />)
						setPollId(null)
						break;

					case "Invalid User ID":
						setAlert(<Alert timeout={10000} title={"Error"} message={"User ID Invalid"} setAlert={setAlert} />)
						verifyId();
						break;
					case "Permission Denied":
						setAlert(<Alert timeout={10000} title={"Not Owner"} message={"Permission Denied"} setAlert={setAlert} />)
						break;

					default:
						console.log(data["error"])
						break;
				}
				return;
			}

			if (data["update"]) {
				//update poll with data from server
				setPoll(
					<Poll pollId={data["pollId"]}
						title={data["title"]}
						options={data["options"]}
						settings={data["settings"]}
						isOwner={data["owner"]}
						votedFor={data["votedFor"]}
						userId={userId}
						ws={client}
					/>)
			}

		}

		//ping server every 5 seconds to avoid being removed from ws connections
		const ping = setInterval(() => {
			client.send(JSON.stringify({ "type": "ping" }))

			if (client.readyState === client.CLOSED) {
				clearInterval(ping)
				setAlert(<Alert timeout={5000} title={"Error"} message={"Connection to server lost"} setAlert={setAlert} />)
				setPoll(null)
			}

		}, 5000)

	}


	return (
		<>
			{alert}
			{poll ? poll : <Welcome setPollId={setPollId} userId={userId} />}
		</>)

}

export default App;
