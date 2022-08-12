import "./index.css"
import {useState, useRef, useEffect} from "react";
import Poll from "./Poll"
import Welcome from "./Welcome";
function App(props) {
  const [poll, setPoll] = useState(null);
  const [pollId, setPollId] = useState("")


  useEffect(() => {
    const idParam = new URLSearchParams(window.location.search).get("poll")
    if (idParam !== "") {
      setPollId(idParam);
    }

  }, [])

  useEffect(() => {
    if (pollId)
      getPoll() 
  }, [pollId])

  const getPoll = async () => {
    if (!pollId) {
      return;
    }
    
    const url = `https://grouppoll.herokuapp.com/api/polls/${pollId}`

    const message = await fetch(url)
      .then((response) => response.json())

    const info = message[0];

    setPoll(<Poll id = {info["_id"]}
                  title = {info["title"]}
                  options = {info["options"]}
                  getPoll = {getPoll} />)


    //subscribe to updates
    const eventSource = new EventSource(`https://grouppoll.herokuapp.com/api/polls/updates/${pollId}`);
    eventSource.addEventListener('update', e => {
      const info = JSON.parse(e.data);
      setPoll(<Poll id = {info["_id"]}
                    title = {info["title"]}
                    options = {info["options"]}
                    getPoll = {getPoll} />)

      console.log("Update received"); 
    });

  }



  return (
    poll ? poll : <Welcome setPollId = {setPollId} />
  )

}

export default App;
