import "./index.css"
import { useEffect, useRef, useState } from "react";
import CreatedBox from "./misc/CreatedBox";


function Welcome(props) {
    const titleInput = useRef(null);
    const [showError, setShowError] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState([]);
    const [allSelected, setAllSelected] = useState(false);


    useEffect(() => {
        if (allSelected) {
            const createdPolls = JSON.parse(localStorage.getItem("created"))
            setSelectedDelete(Object.keys(createdPolls))
        } else
            setSelectedDelete([]);
    }, [allSelected])

    const createPoll = async (e) => {
        e.preventDefault();
        
        const title = titleInput.current.value
        if (title === "") {
            setShowError(true);
            return;
        }
        const url = `${process.env.NODE_ENV !== "production" ? process.env.REACT_APP_DEV_HTTP_URL : process.env.REACT_APP_PROD_HTTP_URL}/api/polls/create`
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title: title, userId: props.userId })
        }).then((response) => {

            if (response.status === 404)
                return 404;
            else
                return response.json()
        
        });
        
        if (response === 404) {
            props.verifyId();
            return;
        }

        if (!response["pollId"]) {
            console.log("Error creating poll");
            return;
        }

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

    const toggleSelected = (e) => {
        const id = e.target.id
        
        for (let i = 0 ; i < selectedDelete.length; i++)
            if (selectedDelete[i] === id) {
                const temp = [...selectedDelete];
                temp.splice(i, 1);
                setSelectedDelete(temp);
                return;
            }
            
        setSelectedDelete([...selectedDelete, id]);

    }
    
  
    const deletePolls = async () => {
        const pollIds = selectedDelete.join(".");
        setAllSelected(false);
        if (pollIds) {
            const url = `${process.env.NODE_ENV !== "production" ? process.env.REACT_APP_DEV_HTTP_URL : process.env.REACT_APP_PROD_HTTP_URL}/api/polls/delete`
            await fetch(url, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({pollIds: pollIds, userId: props.userId })
            }).then(response => response.json());

            const createdPolls = JSON.parse(localStorage.getItem("created"))

            selectedDelete.forEach((id) => {
                delete createdPolls[id]
            })

            if (Object.keys(createdPolls).length === 0)
                localStorage.removeItem("created")
            else
                localStorage.setItem("created", JSON.stringify(createdPolls)); 

            props.addAlert("Polls Deleted", 2000);
            setSelectedDelete([])

        }
    }

    const createdPolls = JSON.parse(localStorage.getItem("created"))
    if (createdPolls) {
        var created = Object.keys(createdPolls).reverse().map((id) =>
                <CreatedBox 
                    id = {id} 
                    key = {id}
                    title = {createdPolls[id]} 
                    toggleSelected = {toggleSelected} 
                    selected = {selectedDelete.includes(id)}
                    checked = {selectedDelete.includes(id)}/>
        )

        created.unshift(
            <li key = "selectAll" className = "h-fit flex justify-between">
                <label htmlFor = "selectAll" className = "text-gray-300 select-none">{"Select All"}</label>
                <input id = "selectAll" checked = {allSelected} onChange = {() => {setAllSelected(!allSelected)}} className = "border border-black ml-2" type="checkbox"></input>
            </li>
        )

    } else
        created = null;    
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center text-center">

            <div className="py-10 bg-slate-700 h-full grid items-center" style = {{
                "boxShadow": "0px 0px 10px 0px rgba(0,0,0,0.5)",
                "zIndex": "1"
            }}>
                <div>
                    <a href="."><h1 className="mx-auto text-5xl lg:text-7xl font-semibold text-gray-200 select-none px-4">Crowd Poll</h1></a>
                    <p className="text-sm lg:text-xl pt-1 mt-2 text-gray-300 select-none">Share a poll with a title <br /> Crowd source answer options <br />Collectively vote on the best one</p>
                </div>
            </div>
         


            <div className="bg-stone-700 grid lg:h-screen items-center">
                <form className="py-10 bg-stone-600 shadow-xl rounded-xl mx-10 mt-5" onSubmit={createPoll}>
                    <h1 className="mx-auto text-xl lg:text-2xl text-gray-200 select-none px-4 mb-2">Create New Poll</h1>
                    <input ref={titleInput} onChange = {() => setShowError(false)} className={`h-10 w-3/4 lg:w-1/2 rounded text-white text-lg  focus:outline-none bg-stone-500 px-2 shadow-md ${showError ? "placeholder:text-red-300" : "placeholder:text-white/90"}`} 
                    placeholder= {`${showError ? "Title can not be blank" : "Enter a title..."}`} />

                    <button type="submit" className="bg-black text-gray-200 border border-black p-2 m-2 rounded">Create Poll</button>
                    <p className = "text-white mt-1 select-none">You can add answer options and edit settings once inside the poll</p>
                </form>


                {created ? 
                <div className = "text-white w-full h-full grid items-center p-2">
                    <div className = "bg-stone-600 w-fit mx-auto p-6 mt-4 rounded-xl shadow-xl">
                        <p className = "text-xl lg:text-2xl mb-4 select-none px-4">Your Created Polls</p>
                        <ul className = "w-full max-h-72 overflow-y-auto mx-auto px-6 list-disc list-inside">
                            {created}
                        </ul>

                        <div className = "mt-4 flex justify-between">
                            <label className = "text-white" onClick = {deletePolls}>
                                {"Delete Selected Polls"}
                            </label>
                            
                            <button onClick = {deletePolls} className = "bg-red-100 rounded border border-black ml-2 px-2 text-black text-xs self-center">{selectedDelete.length}</button>
                        </div>
                    </div>
                </div> 
                : null}
            </div>
        </div>
    );
}


export default Welcome;
