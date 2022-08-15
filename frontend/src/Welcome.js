import "./index.css"
import { useRef, useState } from "react";
import Alert from "./Alert";
function Welcome(props) {
    const titleInput = useRef(null);
    const [alert, setAlert] = useState(null);
    const [showError, setShowError] = useState(false);

    const createPoll = async (e) => {
        e.preventDefault();
        
        const title = titleInput.current.value
        if (title === "") {
            setShowError(true);
            return;
        }
        
        const url = "http://localhost:5001/api/polls/create"
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title: title, owner: props.userId })
        }) .then(response => response.json());


        props.setPollId(response["id"]); //calls getPoll after useEffect
        window.history.replaceState(null, null, `?poll=${response["id"]}`);
    }


    return (

        <>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 items-center text-center">

            <div className="py-10" >
                {alert}
                <a href="."><h1 className="mx-auto text-7xl font-bold text-gray-200 select-none">Crowd Poll</h1></a>
                <p className="text-xl pt-1 mt-2 text-gray-300 select-none">Create a poll with a title <br /> Share the poll and crowd source options <br />Collectively vote on the best one</p>
            </div>


            <div className="bg-slate-600 grid items-center py-10 lg:h-screen">
                <form className="py-10" onSubmit={createPoll}>
                    <input ref={titleInput} className="h-10 mx-2 w-3/4 md:w-1/2 rounded text-black text-lg placeholder:text-black bg-slate-200 px-2 border border-black" placeholder="Enter a title..." />
                    <br />
                    {showError ? <p className="m-1 text-red-200">Title can not be blank. Please enter a title.</p> : null}
                    <button type="submit" className="bg-black text-gray-200 border border-black p-2 m-2 rounded" >Create Poll</button>

                </form>
            </div>


        </div>


        </>
    );
}

export default Welcome;
