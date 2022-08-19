import "./index.css"
import { useEffect, useRef, useState } from "react";
function Welcome(props) {
    const titleInput = useRef(null);
    const [showError, setShowError] = useState(false);
    const [showClear, setShowClear] = useState(false);
    const [created, setCreated] = useState(null);

    const createPoll = async (e) => {
        e.preventDefault();
        
        const title = titleInput.current.value
        if (title === "") {
            setShowError(true);
            return;
        }
        
        const url = "https://crowd-poll.herokuapp.com/api/polls/create"
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title: title, ownerId: props.userId })
        }).then(response => response.json());


        props.setPollId(response["pollId"]); //calls getPoll after useEffect
        window.history.replaceState(null, null, `?poll=${response["pollId"]}`);



        const createdPolls = localStorage.getItem("created")

        if (createdPolls) {
            const temp = JSON.parse(createdPolls)

            temp[response["pollId"]] = title;
            localStorage.setItem("created", JSON.stringify(temp));
        } else {
            localStorage.setItem("created", JSON.stringify({[response["pollId"]]: title}));
        }


    }

    useEffect(() =>{ 
        const createdPolls = JSON.parse(localStorage.getItem("created"))
        if (createdPolls) {
            var createdList = Object.keys(createdPolls).reverse().map((id) => {
                return <li key={id}>
                        <a className = "text-blue-200" href={`?poll=${id}`}>{createdPolls[id]}</a>
                    </li>
            })

        } else
            createdList = null;
        
        setCreated(createdList)
    }, [showClear]);

    const deleteAll = async () => {
        const polls = localStorage.getItem("created");

        if (polls) {
            const pollIds = Object.keys(JSON.parse(polls)).join(".");
            const url = "http://localhost:5001/api/polls/delete"

            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({pollIds: pollIds, userId: props.userId })
            }).then(response => response.json());


            localStorage.removeItem("created"); 
            setShowClear(true);

            setTimeout(() => {
                setShowClear(false);
            }, 3000)
        }
    }

    
    return (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 items-center text-center">

            <div className="py-10" >
                <a href="."><h1 className="mx-auto text-7xl font-bold text-gray-200 select-none">Crowd Poll</h1></a>
                <p className="text-xl pt-1 mt-2 text-gray-300 select-none">Create a poll with a title <br /> Share the poll and crowd source options <br />Collectively vote on the best one</p>
                


                <div className = "text-white mt-8 max-w-4/5 max-h-40 overflow-y-auto w-fit mx-auto border border-white rounded-lg p-3">
                    <p className = "text-lg bold mt-1">Your Created Polls</p>

                    {created ? 
                    <>
                        <button className = "mb-2 text-red-300" onClick = {deleteAll}>
                            Delete All
                        </button>

                        <ul className = "w-full truncate text-left list-disc list-inside">{created}</ul>
                    </>
                    :
                        showClear ? 
                        <p className = "text-red-200 text-sm">Deleted All</p>
                        :
                        <p className = "text-white text-sm">No created polls. Create one using the input!</p>

                    }
                </div>
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
    );
}

export default Welcome;
