import "./index.css"
import { useState, useEffect } from "react";
import Poll from "./Poll"
import Welcome from "./Welcome";
import Alert from "./Alert";

function App(props) {
	const [poll, setPoll] = useState(null);
	const [alert, setAlert] = useState(null);

	const [pollId, setPollId] = useState("")
	const [userId, setUserId] = useState("")

	useEffect(() => {
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
						setAlert(<Alert timeout = {10000} title = {"Connection Error"} message = {"Failed to connect to server. Please try again in a moment"} setAlert = {setAlert}/>)
						console.log(error)
						return -1;
					});
					
				if (message === -1) 
					return;
				else if (message) {
					storedUserId = message["_id"]
					localStorage.setItem("userId", storedUserId)
					console.log("NF. N " + storedUserId)
				} else { //userFound
					console.log("R " + storedUserId)
				}
	
			} else {
				const message = await fetch("http://localhost:5001/api/users/")
					.then((response) => response.json())

				localStorage.setItem("userId", storedUserId)
				storedUserId = message["_id"]
				console.log("N " + storedUserId)	
			}

			setUserId(storedUserId);
		}

		verifyId();

		const idParam = new URLSearchParams(window.location.search).get("poll")
		if (idParam !== "") {
			setPollId(idParam);
		}

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

		const url = `http://localhost:5001/api/polls/${pollId}&${userId}`

		const message = await fetch(url)
			.then((response) => response.json())
			.catch( (error) => {
				setAlert(<Alert timeout = {10000} title = {"Error Getting Poll"} message = {"Please try again in a moment"} setAlert = {setAlert}/>)
				console.log(error)
				return;
			});

		console.log(message)
		setPoll(<Poll id={message["id"]}
			title={message["title"]}
			options={message["options"]}
			settings = {message["settings"]}
			isOwner = {message["owner"]}
			defaultVotedFor = {message["votedFor"]}
			userId = {userId}
		/>)


		//subscribe to updates
		const eventSource = new EventSource(`http://localhost:5001/api/polls/updates/${pollId}&${userId}`);
		eventSource.addEventListener('update', e => {
			try {
				const info = JSON.parse(e.data);
				setPoll(<Poll 								
						options = {info["options"]}
						settings = {info["settings"]}

						//below won't change
						title={message["title"]}
						id={message["id"]}
						userId = {userId}
						isOwner = {message["owner"]}
						//defaultVotedFor will not change. State updated in Poll.js
						defaultVotedFor = {message["votedFor"]}
						/>)
				
				console.log(info["options"] )
				console.log("Update received");
			} catch (error) {
				setAlert(<Alert title = {"Error"} message = {"Please try again"} setAlert = {setAlert}/>)
				console.log("reloading")
				window.location.reload();
			}
		});

	}


	return(
	<> 
		{alert}
		{poll ? poll : <Welcome setPollId={setPollId} userId = {userId}/>}
	</>)

}

export default App;
