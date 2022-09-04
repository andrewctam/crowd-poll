import { useRef, useState, useEffect } from 'react'
import Option from "./Option"

function Poll(props) {
    const optionInput = useRef(null);
    const [showError, setShowError] = useState(false);
    const [votedFor, setVotedFor] = useState(props.defaultVotedFor);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [sortingMethod, setSortingMethod] = useState("orderCreated");
    
    useEffect(() => {
        if ((sortingMethod === "voteCount" && props.settings["hideVotes"]) && 
            (!props.isOwner || (props.isOwner && props.settings["hideVotesForOwner"]))) {
                setSortingMethod("orderCreated");
        } 
    // eslint-disable-next-line
    }, [props.settings["hideVotes"], props.settings["hideVotesForOwner"], props.isOwner]);

    const addOption = async (e) => {
        e.preventDefault();
        const url = "https://crowdpoll.fly.dev/api/polls/option"
        const optionTitle = optionInput.current.value

        if (optionTitle === "") {
            setShowError(true);
            return;
        } else {
            setShowError(false);
        }
        

        await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                optionTitle: optionTitle, 
                pollId: props.pollId, 
                userId: props.userId
            })
        })

        optionInput.current.value = "";
    }

    const toggleSelected = (optionId) => {
        
        for (let i = 0 ; i < selectedOptions.length; i++)
            if (selectedOptions[i] === optionId) {
                const temp = [...selectedOptions];
                temp.splice(i, 1);
                setSelectedOptions(temp);
                return;
            }

        setSelectedOptions([...selectedOptions, optionId]);
    }

    const deleteSelected = async (e) => {
        if (selectedOptions.length === 0)
            return;
            
        const url = "https://crowdpoll.fly.dev/api/polls/option"
        await fetch(url, {
            method: "delete",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                pollId: props.pollId, 
                userId: props.userId, 
                options: selectedOptions.join(".")
            })
        }).then( response => { 
            if (response.status === 401)
                alert("Error. Permission Denied!")
        })

        setSelectedOptions([]);

    }

    
   
    var sorted = [...props.options];

    switch(sortingMethod) {
        case "alphabetically":
            sorted = sorted.sort(  (a, b) => { 
                if (b["optionTitle"] > a["optionTitle"])
                    return -1;
                else
                    return 1;
            } )
            break;
            
        case "voteCount":
            sorted = sorted.sort(  (a, b) => { return b["votes"] - a["votes"]  } )
            break;

        case "orderCreated": //already sorted in order created
        default:
            break;
    }
    
    const options = sorted.map(obj =>
        <Option
            key={obj["_id"]}
            pollId={props.pollId}
            votes={obj["votes"]}
            optionTitle={obj["optionTitle"]}
            optionId={obj["_id"]}
            userId = {props.userId}
            setVotedFor = {setVotedFor}
            voted = {votedFor.includes(obj["_id"])}
            approved = {!props.settings["approvalRequired"] || obj["approved"]}
            isOwner = {props.isOwner}
            toggleSelected = {toggleSelected}
            disableVoting = {props.settings["disableVoting"]}
         />);

    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center text-center select-none">
            
            <div className="lg:h-screen flex flex-col">
                <div className="py-10 bg-slate-700">
                    <a href="." className="mx-auto text-7xl font-semibold text-gray-200 select-none">Crowd Poll</a>
                    
                    <h1 className="text-xl pt-1 text-white select-none">Link to the poll:</h1>
                    <input readOnly={true} onClick={(e) => e.target.select()} className="h-10 md:w-1/2 w-3/4 rounded text-black text-lg placeholder:text-black bg-slate-200 px-2 border border-black" value={window.location} />

                    

                    {props.isOwner ? 
                    <div className = "border border-white mt-4 p-3 w-fit mx-auto rounded-xl">
                        <h1 className='text-white text-2xl mt-1 font-semibold'>Settings</h1>
                        
                        <p className='text-white mb-3'> {"(only you can edit these)"} </p>

                        <SettingCheckBox
                            pollId = {props.pollId}
                            userId = {props.userId}
                            name = "disableVoting"
                            text ="Disable Voting"
                            indent = {false}
                            active= {props.settings["disableVoting"]} />

                        <SettingCheckBox
                            pollId = {props.pollId}
                            userId = {props.userId}
                            name = "hideVotes"
                            text = "Hide Vote Count"
                            indent = {false}
                            active = {props.settings["hideVotes"]} />

                        {props.isOwner && props.settings["hideVotes"] ?
                        <SettingCheckBox
                            pollId = {props.pollId}
                            userId = {props.userId}
                            name = "hideVotesForOwner"
                            text = "Hide Vote Count For You" 
                            indent = {true}
                            active = {props.settings["hideVotesForOwner"]} />
                        : null}

                        <SettingCheckBox
                            pollId = {props.pollId}
                            userId = {props.userId}
                            name = "limitOneVote"
                            text = "Limit Users To One Vote" 
                            indent = {false}
                            active = {props.settings["limitOneVote"]} />

                        <SettingCheckBox
                            pollId = {props.pollId}
                            userId = {props.userId}
                            name ="approvalRequired"
                            text= "New Options Require Approval" 
                            indent = {false}
                            active = {props.settings["approvalRequired"]} />
                        
                        {props.isOwner && props.settings["approvalRequired"] ?
                        <SettingCheckBox
                            pollId = {props.pollId}
                            userId = {props.userId}
                            name = "autoApproveOwner"
                            text = "Auto Approve Your Options" 
                            indent = {true}
                            active = {props.settings["autoApproveOwner"]} />   
                        : null}
                        

                        
                        <div className = "flex justify-between">
                            <label className = "px-1 mr-2 text-white" onClick = {deleteSelected}>
                                {"Delete Selected Options"}
                            </label>
                            
                            <button onClick = {deleteSelected} className = "bg-red-100 rounded border border-black h-fit self-center px-2 text-black text-xs">{selectedOptions.length}</button>
                        </div> 
                        

                        
                    </div> 
                    :
                    (props.settings["disableVoting"] || props.settings["hideVotes"] || props.settings["limitOneVote"] || props.settings["approvalRequired"]) ?
                    <div className = "border border-white p-4 rounded-xl mx-auto w-fit mt-4">
                        <h1 className="text-center text-2xl font-semibold pt-1 text-white select-none mb-3">Settings</h1>

                        <ul className = "text-left">
                            <SettingListDisplay
                                display = {props.settings["disableVoting"]}
                                text = "Adding and removing votes is disabled" 
                            />
                            
                            <SettingListDisplay
                                display = {props.settings["hideVotes"]}
                                text = "Vote counts are hidden" 
                            />

                            <SettingListDisplay
                                display = {props.settings["limitOneVote"]}
                                text = "You may only cast one vote at a time" 
                            />

                            <SettingListDisplay
                                display = {props.settings["approvalRequired"]}
                                text = "New options require approval from the owner" 
                            />

                        </ul>
                    
                    </div>
                    : null}
                    
                    <div className='text-lg text-white mt-4'>
                        {"Click on an option to add or remove your vote"}
                    </div>
                    <div className='text-lg text-white'>
                        {"You can " + (props.settings["approvalRequired"] ? "request to " : "") + "add more options using the input below"}
                    </div>

                </div>

                <div className = "flex-grow bg-slate-600 p-10 flex items-center justify-center">
                    <form onSubmit={addOption} className = "w-full">
                        <h1 className="mx-auto text-2xl text-gray-200 select-none px-4 mb-2">Add Answer Option</h1>
                        <input ref={optionInput}  className="h-10 md:w-1/2 w-3/4 rounded text-black text-lg placeholder:text-black bg-slate-200 p-2 border border-black" placeholder="Enter an option..." />
                        <button type="submit" className="bg-black text-gray-200 border border-black p-2 m-2 rounded" >{props.settings["approvalRequired"] ? "Request To Add Option" : "Add Option"}</button>
                        {showError ? <p className="m-1 text-red-300">Option can not be blank. Please enter some text.</p> : null}
                    </form>
                    
                    
               </div>
            </div>



            <div className="bg-stone-600 lg:h-screen overflow-y-auto">
            
                <div className="grid items-center bg-stone-700 py-8 text-3xl mb-4 bold text-white">{props.title}</div>                

                {options.length === 0 ? 
                    <p className='text-lg text-white'>
                        {"No answer options yet, add one using the input!"}
                    </p> 
                    :
                    <div className = "inline-block border border-white rounded-lg px-2 mx-2">
                    
                        <p className = "inline-block m-1 text-white font-semibold text-wrap-">Sort By: </p>
                        <SortAnchor 
                            name = {"Order Created"}
                            id = "orderCreated"
                            setSortingMethod = {setSortingMethod}
                            selected = {sortingMethod === "orderCreated"}
                            disabled = {false}

                        />
                        <SortAnchor 
                            name = {"Vote Count"}
                            id = "voteCount"
                            setSortingMethod = {setSortingMethod}
                            selected = {sortingMethod === "voteCount"}
                            disabled = {(props.settings["hideVotes"] && (!props.isOwner || (props.isOwner && (props.settings["hideVotesForOwner"]))))}

                        />
                        <SortAnchor 
                            name = {"Alphabetically"}
                            id = "alphabetically"
                            setSortingMethod = {setSortingMethod}
                            selected = {sortingMethod === "alphabetically"}
                            disabled = {false}
                        />

                    </div>}
                

                <div className='mx-10 my-3'>
                    {options}
                </div>
                
            </div>

        </div>)

}

const SettingCheckBox = (props) => {
    const [clientActive, setClientActive] = useState(props.active);

    useEffect(() => {
        setClientActive(props.active);
    }, [props.active])

    const handleChange = async (e) => {
        const url = "https://crowdpoll.fly.dev/api/polls/setting"
        setClientActive(!clientActive);

        await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pollId: props.pollId,
                userId: props.userId,
                setting: props.name,
                newValue: e.target.checked
            })
        })

    }

    return (<div className = "text-white flex justify-between">
        <label className = {"px-1 mr-2 " + (props.indent ? "text-gray-300 ml-4" : "text-white")} htmlFor={props.name}>
            {props.text}
        </label>

        <input className = "border border-black ml-1 self-center" id={props.name} type="checkbox" onChange = {handleChange} checked = {clientActive}></input>
    </div>)
}

const SettingListDisplay = (props) => {
    if (props.display)
        return <li className="text-white text-md">{props.text}</li>
    else
        return null;
}

const SortAnchor = (props) => {

    const setSorting = () => {
        props.setSortingMethod(props.id);
    }

    if (props.disabled)
        return (<div 
                className = {"inline-block m-2 text-gray-400"}>
                {props.name}
            </div>)

    return (<div 
        onClick = {setSorting} 
        className = {"cursor-pointer inline-block m-2 " + (props.selected ? "text-sky-200 underline" : "text-white")}>
        {props.name}
    </div>)

}


export default Poll;