import "./index.css"
import {useState, useRef, useEffect, useInsertionEffect} from "react";
import Poll from "./Poll"


function App() {

  const titleInput = useRef(null);
  const [poll, setPoll] = useState(null);
  const [pollId, setPollId] = useState("")
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPoll();
  }, [pollId])

  useEffect(() => {
    const idParam = new URLSearchParams(window.location.search).get("poll")

    if (idParam !== "")
      setPollId(idParam);

    setLoaded(true)

  }, [])


  const refresh = async () => {
    await getPoll()
    console.log("Hello")
    setTimeout(refresh, 1000);
  }

  const getPoll = async () => {
    const url = `http://localhost:5001/api/polls/${pollId}`

    const message = await fetch(url)
      .then((response) => response.json())

    const info = message[0];

    setPoll(<Poll id = {info["_id"]}
                  title = {info["title"]}
                  options = {info["options"]}
                  getPoll = {getPoll} />)

    setPollId(info["_id"]);
    console.log(info["_id"]);
  }


  const createPoll = async (e) => {
    e.preventDefault();

    const url = "http://localhost:5001/api/polls/create"
    const title = titleInput.current.value
    if (title === "") {
      alert("Enter title")
      return;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({title: title})
    })   
    .then(response => response.json() );   

    setPollId(response["id"]);
    console.log(response["id"])

    window.history.replaceState(null, null, `?poll=${response["id"]}`);


  }

  return ( !loaded ? null :
    <div className = "grid md:grid-cols-1 lg:grid-cols-2 items-center text-center h-screen">
      <div className = "py-10" >
        <a href = "http://localhost:3000/"><h1 className = "mx-auto text-7xl font-bold text-gray-200">Group Poll</h1></a>
        <p className="text-xl pt-1 text-gray-300">Create a poll with just a title <br /> Share the poll and crowd source options <br />Collectively vote on the best option</p>
      </div>

      <div>
        {poll ? poll : 
        <form className = "py-10 bg-slate-400 h-screen" onSubmit={createPoll}>
          <input required = "true" ref = {titleInput} className = "h-10 w-96 rounded text-black text-lg placeholder:text-black bg-slate-200 px-2 border border-black" placeholder="Enter a title..."/>
          <br/ >
          <button type="submit" className = "bg-black text-gray-200 border border-black p-2 m-2 rounded" >Create Poll</button>
        </form>
        }
      </div>



    </div>
    );
}

export default App;
