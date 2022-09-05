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
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
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
				const message = await fetch("https://crowdpoll.fly.dev/api/users/")
					.then((response) => response.json())
				storedUserId = message["_id"]
					
				localStorage.removeItem("created")
				localStorage.setItem("userId", storedUserId)
				console.log("N " + storedUserId)	
			}

			setUserId(storedUserId);
		}


		verifyId();

		const idParam = new URLSearchParams(window.location.search).get("poll")

		if (idParam) {
			setPollId(idParam);
		} else {
			setLoaded(true);
		}

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

		const url = `https://crowdpoll.fly.dev/api/polls/${pollId}&${userId}`

		const message = await fetch(url)
			.then((response) => {
				if (response.status === 400)
					return "Poll DNE"
				else
					return response.json()
			})	
			.catch((error) => {
				setAlert(<Alert timeout = {10000} title = {"Error Getting Poll"} message = {"Please try again in a moment"} setAlert = {setAlert}/>)
				console.log(error)
				return;
			});

		if (message === "Poll DNE") {
			setAlert(<Alert timeout = {10000} title = {"Error"} message = {"Poll Deleted or Does Not Exist"} setAlert = {setAlert}/>)
			setLoaded(true);
			return;
		}

		setPoll(<Poll pollId={message["pollId"]}
			title={message["title"]}
			options={message["options"]}
			settings = {message["settings"]}
			isOwner = {message["owner"]}
			defaultVotedFor = {message["votedFor"]}
			userId = {userId}
		/>)


		//subscribe to updates
		const eventSource = new EventSource(`https://crowdpoll.fly.dev/api/polls/updates/${pollId}&${userId}`);
		eventSource.addEventListener('update', e => {
			try {
				const update = JSON.parse(e.data);
				
				setPoll(<Poll 								
						options = {update["options"]}
						settings = {update["settings"]}

						//below won't change
						title={message["title"]}
						pollId={message["pollId"]}
						userId = {userId}
						isOwner = {message["owner"]}
						//defaultVotedFor will not change. State updated in Poll.js
						defaultVotedFor = {message["votedFor"]}
						/>)

				console.log("U");
			} catch (error) {
				setAlert(<Alert title = {"Error"} message = {"Please try again"} setAlert = {setAlert}/>)
				console.log("Error, Reloading")
				window.location.reload();
			}
		});
		
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
