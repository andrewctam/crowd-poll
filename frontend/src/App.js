import "./index.css"
import {useState, useRef, useEffect} from "react";
import Poll from "./Poll"

function App() {

  const titleInput = useRef(null);
  const [poll, setPoll] = useState(null);
  const [pollId, setPollId] = useState("")
  const [loaded, setLoaded] = useState(true);



  useEffect(() => {
    const idParam = new URLSearchParams(window.location.search).get("poll")
    if (idParam !== "") {
      setPollId(idParam);
    }

    const eventSource = new EventSource("http://localhost:5001/api/polls/updates");
    eventSource.addEventListener('update', e => {
      console.log(e)
      const info = JSON.parse(e.data);
      setPoll(<Poll id = {info["_id"]}
                    title = {info["title"]}
                    options = {info["options"]}
                    getPoll = {getPoll} />)

      console.log("msg"); 
      
    });

  }, [])

  useEffect(() => { if (pollId) getPoll() }, [pollId])

  const getPoll = async () => {
    console.log(pollId)

    if (!pollId) {
      return;
    }
    
    const url = `http://localhost:5001/api/polls/${pollId}`

    const message = await fetch(url)
      .then((response) => response.json())

    const info = message[0];

    setPoll(<Poll id = {info["_id"]}
                  title = {info["title"]}
                  options = {info["options"]}
                  getPoll = {getPoll} />)

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
    console.log('a')

    setPollId(response["id"]);
  
    window.history.replaceState(null, null, `?poll=${response["id"]}`);
  }

  return ( !loaded ? null :
    <div className = "grid md:grid-cols-1 lg:grid-cols-2 items-center text-center">

      <div className = "py-10" > 
        <a href = "http://localhost:3000/"><h1 className = "mx-auto text-7xl font-bold text-gray-200 select-none">Group Poll</h1></a>

        {poll ?
        <div className = "mt-2">
          <h1 className="text-xl pt-1 text-gray-300 select-none">Share this link to your poll:</h1>
          <input readOnly = {true} onClick = {(e) => e.target.select()}  className = "h-10 w-96 rounded text-black text-lg placeholder:text-black bg-slate-200 px-2 border border-black" value={window.location}/>
          </div>

          :

          <p className="text-xl pt-1 mt-2 text-gray-300 select-none">Create a poll with a title <br /> Share the poll and crowd source options <br />Collectively vote on the best one</p>
        }

      </div>


      <div className = "bg-slate-600 grid items-center py-10 lg:h-screen">
          {poll ? 
          poll
          : 
          <form className = "py-10" onSubmit={createPoll}>
            <input required = {true} ref = {titleInput} className = "h-10 mx-2 w-96 rounded text-black text-lg placeholder:text-black bg-slate-200 px-2 border border-black" placeholder="Enter a title..."/>
            <br/ >
            <button type="submit" className = "bg-black text-gray-200 border border-black p-2 m-2 rounded" >Create Poll</button>
          </form>
          }
      </div>

      



    </div>
    );
}

export default App;
