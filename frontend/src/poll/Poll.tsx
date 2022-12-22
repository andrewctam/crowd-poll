import React, { useRef, useState, useEffect, useCallback, useReducer } from 'react'
import Option from "./Option"
import Dropdown from "./Dropdown"
import DropdownOption from './DropdownOption';
import Statistics from './Statistics';
import Settings from './Settings';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import TitleBox from './TitleBox';
import { PollData } from '../App';

interface PollProps extends PollData {
    ws: W3CWebSocket
    alertDispatch: React.Dispatch<any>
}

type SelectedOptionsAction = 
    {type: "TOGGLE", payload: {optionId: string}} |
    {type: "CLEAR"} |
    {type: "SELECT_ALL"}

function Poll(props: PollProps) {
    const optionInput = useRef<HTMLInputElement>(null);
    const [showError, setShowError] = useState(false);

    //View as user. Still the owner and 
    const [userView, setUserView] = useState(false);

    const [selectedOptions, dispatch] = useReducer((state: string[], action: SelectedOptionsAction) => {
        switch (action.type) {
            case "TOGGLE":
                if (state.includes(action.payload.optionId)) {
                    return state.filter(oId => oId !== action.payload.optionId);
                } else {
                    return [...state, action.payload.optionId];
                }
            case "SELECT_ALL":
                return props.options.map((option) => option._id)
            case "CLEAR":
                return [];
            default:
                return state;
        }
    }, []);

    const toggleSelection = useCallback((optionId: string) => {
        dispatch({ type: "TOGGLE", payload: {"optionId": optionId} });
    }, []);

    const [sortingMethod, setSortingMethod] = useState("Order Created");
    const [showSorting, setShowSorting] = useState(false);

    const [filterMethod, setFilterMethod] = useState("All");
    const [showFilter, setShowFilter] = useState(false);

    const [selectedSlice, setSelectedSlice] = useState("");

    useEffect(() => {
        //Reset sorting method if votes are hidden and Vote Count is selected
        if ((sortingMethod === "Vote Count" && props.settings["hideVotes"]) &&
            (!props.isOwner || (userView && props.settings["hideVotesForOwner"]))) {
            setSortingMethod("Order Created");
        }
        // eslint-disable-next-line
    }, [props.settings["hideVotes"], props.settings["hideVotesForOwner"], props.isOwner]);

    useEffect(() => {
        //Reset filter method if Pending Approval is disabled
        if (filterMethod === "Pending Approval" && !props.settings["approvalRequired"])
            setFilterMethod("All")

        // eslint-disable-next-line
    }, [props.settings["approvalRequired"]]);

    const toggleUserView = async () => {
        const url = `${process.env.NODE_ENV !== "production" ? process.env.REACT_APP_DEV_HTTP_URL : process.env.REACT_APP_PROD_HTTP_URL}/api/users/userView`
        await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId: props.userId, newValue: !userView })
        })

        //refresh poll with what the users see
        props.ws.send(JSON.stringify({
            "type": "getPoll",
            "pollId": props.pollId,
            "userId": props.userId
        }));

        setUserView(!userView)
    }


    const addOption = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!optionInput.current)
            return;

        const optionTitle = optionInput.current.value
        if (optionTitle === "") {
            setShowError(true);
            return;
        } else {
            setShowError(false);
        }

        props.ws.send(JSON.stringify({
            "type": "addOption",
            "pollId": props.pollId,
            "userId": props.userId,
            "optionTitle": optionTitle
        }));

        if (props.settings["approvalRequired"] && (!props.isOwner || !props.settings["autoApproveOwner"] || userView)) {
            props.alertDispatch({type: "ADD_ALERT", payload: {
                msg: "Request to add option sent!",
                time: 2000,
                type: "success"
            }})

        } else {
            props.alertDispatch({type: "ADD_ALERT", payload: {
                msg: "Option added!",
                time: 2000,
                type: "success"
            }})
        }
        
        optionInput.current.value = "";
    }

    const deleteSelected = async (e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLLabelElement>) => {
        if (selectedOptions.length === 0 || !props.isOwner)
            return;

        props.ws.send(JSON.stringify({
            "type": "deleteOptions",
            "userId": props.userId,
            "pollId": props.pollId,
            "optionsToDelete": selectedOptions.join(".")
        }));

        props.alertDispatch({type: "ADD_ALERT", payload: {
            msg: "Options deleted!",
            time: 2000,
            type: "success"
        }})
        
        dispatch({ type: "CLEAR" });
    }


    let displayedOptions = [...props.options];
    switch (filterMethod) {
        case "Voted For":
            displayedOptions = displayedOptions.filter((option) => {
                return props.votedFor.includes(option["_id"])
            })
            break;
        case "Not Voted For":
            displayedOptions = displayedOptions.filter((option) => {
                return !props.votedFor.includes(option["_id"]) && option["approved"]
            })
            break;
        case "Approved":
            displayedOptions = displayedOptions.filter((option) => {
                return option["approved"]
            })
            break;
        case "Pending Approval":
            displayedOptions = displayedOptions.filter((option) => {
                return !option["approved"]
            })
            break;

        case "All":
        default:
            break;

    }

    switch (sortingMethod) {
        case "Alphabetical Order":
            displayedOptions = displayedOptions.sort((a, b) => { return (a["optionTitle"] > b["optionTitle"]) ? 1 : -1 })
            break;

        case "Vote Count":
            displayedOptions = displayedOptions.sort((a, b) => { return b["votes"] - a["votes"] })
            break;

        case "Order Created": //already sorted in order created
        default:
            break;
    }


    return ( 
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center text-center select-none ">
            <div className="lg:h-screen overflow-y-auto pt-5 pb-10 bg-slate-700 grid items-center relative" style = {{
                    "boxShadow": "0px 0px 10px 0px rgba(0,0,0,0.5)",
                    "zIndex": "1"
                }}>
                    
                <div>
                    <a href="/" className="mx-auto text-5xl block lg:text-6xl font-semibold text-gray-200 select-none">Crowd Poll</a>

                    <input
                        readOnly={true} 
                        onClick={(e) => (e.target as HTMLTextAreaElement).select()} 
                        className="h-10 w-2/3 lg:w-1/2 rounded mt-4 text-black placeholder:text-black shadow-md bg-slate-300 px-2" 
                        value={window.location.toString()} 
                    />


                    {props.isOwner ? <>
                        <div className = "absolute bottom-2 right-2 text-xs text-white">                 
                            <div className="flex justify-between">
                                <label htmlFor={"userView"} className = "text-white">
                                    View as User
                                </label>

                                <input 
                                    className="w-4 h-4 rounded-xl ml-2 self-center" 
                                    id = {"userView"} 
                                    type="checkbox"
                                    checked={userView} 
                                    onChange={toggleUserView}
                                />
                            </div>
                        </div>


                        <div className = "absolute bottom-2 left-2 text-xs text-white">
                            <p className = "inline">
                                {"Viewing as "}
                            </p>
                            <p className = {`inline ${userView ? "text-rose-200" : "text-sky-200"}`}>
                                {userView ? "User" : "Owner"}
                            </p>
                        </div>

                    </>: null}
                    


                    <Settings 
                        ws = {props.ws}
                        isOwner = {!userView && props.isOwner}
                        pollId = {props.pollId}
                        userId = {props.userId}
                        settings = {props.settings}
                    />
                    

                    <Statistics
                        options={props.options}
                        setSelectedSlice={setSelectedSlice}
                    />
                </div>

            </div>


            <div className="bg-stone-700 lg:h-screen overflow-y-auto">

                <TitleBox title = {props.title} />

                {props.options.length === 0 ?
                    <p className='text-md lg:text-lg text-white'>
                        {"No Answer Options Yet"}
                    </p>
                    :
                    <div>

                        <Dropdown name="Sort By" show={showSorting} setShow={setShowSorting} method={sortingMethod}>
                            <DropdownOption key={"Order Created"} name={"Order Created"} setSortingMethod={setSortingMethod} selected={sortingMethod === "Order Created"} disabled={false} />
                            <DropdownOption key={"Vote Count"} name={"Vote Count"} setSortingMethod={setSortingMethod} selected={sortingMethod === "Vote Count"}
                                disabled={props.settings["hideVotes"] && (!props.isOwner || userView || props.settings["hideVotesForOwner"])} />

                            <DropdownOption key={"Alphabetical Order"} name={"Alphabetical Order"} setSortingMethod={setSortingMethod} selected={sortingMethod === "Alphabetical Order"} disabled={false} />
                        </Dropdown>

                        <Dropdown name="Filter By" show={showFilter} setShow={setShowFilter} method={filterMethod}>
                            <DropdownOption key={"All"} name={"All"} setSortingMethod={setFilterMethod} selected={filterMethod === "All"} disabled={false} />
                            <DropdownOption key={"Voted For"} name={"Voted For"} setSortingMethod={setFilterMethod} selected={filterMethod === "Voted For"} disabled={false} />
                            <DropdownOption key={"Not Voted For"} name={"Not Voted For"} setSortingMethod={setFilterMethod} selected={filterMethod === "Not Voted For"} disabled={false} />

                            {!userView && props.isOwner ?
                                <DropdownOption key={"Approved"} name={"Approved"} setSortingMethod={setFilterMethod} selected={filterMethod === "Approved"} disabled={false}
                                /> : null}

                            {!userView && props.isOwner ?
                                <DropdownOption key={"Pending Approval"} name={"Pending Approval"} setSortingMethod={setFilterMethod} selected={filterMethod === "Pending Approval"} disabled={!props.settings["approvalRequired"]}
                                /> : null}
                        </Dropdown>

                        {props.isOwner && selectedOptions.length > 0 ? 
                            <div className = "text-white mt-2 justify-center flex px-4 py-2 rounded-xl bg-stone-600 w-fit mx-auto shadow-md">
                                    <label htmlFor={"selectAll"}>
                                        Select All
                                    </label>

                                    <input 
                                        className="w-4 h-4 rounded-xl ml-1 self-center" 
                                        id = {"selectAll"} 
                                        type="checkbox"
                                        checked={selectedOptions.length === props.options.length} 
                                        onChange={() => {
                                            if (selectedOptions.length === props.options.length)
                                                dispatch({type: "CLEAR"})
                                            else
                                                dispatch({type: "SELECT_ALL"});
                                    }}/>



                                    <label className="px-1 ml-6 text-red-100" onClick={deleteSelected}>
                                        {"Delete Selected Options"}
                                    </label>

                                    <button onClick={deleteSelected}
                                        className="bg-red-200 rounded border border-black h-fit self-center px-2 text-black text-xs"
                                    >     
                                        {selectedOptions.length}
                                    </button>

                            </div>
                        : null}

                    </div>}

                <div className='mx-10 my-3 lg:h-fit h-screen'>
                    {displayedOptions.map(obj =>
                        <Option
                            userId={props.userId}
                            pollId={props.pollId}
                            isOwner={!userView && props.isOwner}
                            ws={props.ws}
                            alertDispatch={props.alertDispatch}

                            votes={obj["votes"]}
                            optionTitle={obj["optionTitle"]}
                            optionId={obj["_id"]}
                            key={obj["_id"]}

                            voted={props.votedFor.includes(obj["_id"])}
                            pieSelected = {selectedSlice === obj["_id"]}
                            selected = {selectedOptions.includes(obj["_id"])}
                            toggleSelection={toggleSelection}
                            approved={!props.settings["approvalRequired"] || obj["approved"]}
                            disableVoting={props.settings["disableVoting"]}
                            alreadyVoted = {props.settings["limitOneVote"] && props.votedFor.length > 0}
                        />)
                    }
                    
                    
                    <form onSubmit={addOption} className="w-full sticky bottom-2 z-10 bg-[#4b4a49] rounded-xl shadow-md flex">
                        <input ref={optionInput} 
                            className={`h-10 flex-grow m-auto text-white lg:text-lg pl-3 bg-transparent focus:outline-none ${showError ? "placeholder:text-red-300" : "placeholder:text-white/70"}`} 
                            onChange = {() => setShowError(false)}
                            placeholder={showError ? "Answer option can not be blank" : "Add an answer option..."}/>

                        <button type="submit" className="bg-stone-900 text-gray-200 p-2 m-2 rounded text-sm lg:text-md">{props.settings["approvalRequired"] ? "Request To Add Option" : "Add Option"}</button>
                    </form>


            </div>

        </div>
        </div>)

}



export default Poll;
