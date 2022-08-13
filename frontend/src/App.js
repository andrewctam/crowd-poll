import "./index.css"
import { useState, useEffect } from "react";
import Poll from "./Poll"
import Welcome from "./Welcome";

function App(props) {
	const [poll, setPoll] = useState(null);
	const [isOwner, setIsOwner] = useState(null);
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
					})
				
				if (message) {
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
	}, [pollId, userId])

	const getPoll = async () => {
		if (!pollId) {
			return;
		}

		const url = `http://localhost:5001/api/polls/${pollId}&${userId}`

		const message = await fetch(url)
			.then((response) => response.json())
			.catch( (error) => {
				console.log(error)
			});

		console.log(message)
		setPoll(<Poll id={message["id"]}
			title={message["title"]}
			options={message["options"]}
			settings = {message["settings"]}
			isOwner = {message["owner"]}
			votedFor = {message["votedFor"]}
			userId = {userId}
		/>)


		setIsOwner(message["owner"])

		//subscribe to updates
		const eventSource = new EventSource(`http://localhost:5001/api/polls/updates/${pollId}`);
		eventSource.addEventListener('update', e => {
			const info = JSON.parse(e.data);

			setPoll(<Poll id={info["id"]}
							title={info["title"]}
							options={info["options"]}
							settings = {info["settings"]}

							//below won't change
							userId = {userId}
							isOwner = {message["owner"]}
							/>)

			console.log("Update received");
		});

	}



	return (
		poll ? poll : <Welcome setPollId={setPollId} userId = {userId}/>
	)

}

export default App;
