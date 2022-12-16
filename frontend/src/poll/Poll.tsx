import React, { useRef, useState, useEffect, useCallback, useReducer } from 'react'
import Option from "./Option"
import Dropdown from "./misc/Dropdown"
import SettingCheckBox from './misc/SettingCheckBox';
import SettingListDisplay from './misc/SettingListDisplay';
import DropdownOption from './misc/DropdownOption';
import Statistics from './Statistics';
import useAlert from '../hooks/useAlert';
import { w3cwebsocket as W3CWebSocket } from "websocket";

interface PollProps {
    pollId: string
    title: string
    isOwner: boolean
    userId: string
    options: {
        approved: boolean
        optionTitle: string
        votes: number
        _id: string
    }[]
    votedFor: string[]
    ws: W3CWebSocket
    settings: {
        hideVotes: boolean
        hideVotesForOwner: boolean
        approvalRequired: boolean
        autoApproveOwner: boolean
        disableVoting: boolean
        limitOneVote: boolean
    }
}

type SelectedOptionsAction = 
    {type: "TOGGLE", payload: {optionId: string}} |
    {type: "CLEAR"}


function Poll(props: PollProps) {
    const optionInput = useRef<HTMLInputElement>(null);
    const [showError, setShowError] = useState(false);

    const [selectedOptions, dispatch] = useReducer((state: string[], action: SelectedOptionsAction) => {
        switch (action.type) {
            case "TOGGLE":
                if (state.includes(action.payload.optionId)) {
                    return state.filter(oId => oId !== action.payload.optionId);
                } else {
                    return [...state, action.payload.optionId];
                }
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

    const [pieSelected, setPieSelected] = useState<string>("");

    useEffect(() => {
        if ((sortingMethod === "Vote Count" && props.settings["hideVotes"]) &&
            (!props.isOwner || (props.isOwner && props.settings["hideVotesForOwner"]))) {
            setSortingMethod("Order Created");
        }
        // eslint-disable-next-line
    }, [props.settings["hideVotes"], props.settings["hideVotesForOwner"], props.isOwner]);

    useEffect(() => {
        if (filterMethod === "Pending Approval" && !props.settings["approvalRequired"])
            setFilterMethod("All")

        // eslint-disable-next-line
    }, [props.settings["approvalRequired"]]);


    const [alerts, addAlert] = useAlert();

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

        if (props.settings["approvalRequired"] && (!props.isOwner || !props.settings["autoApproveOwner"])) {
            addAlert("Request to add option sent!", 2000);
        } else {
            addAlert("Option added!", 2000);
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

        addAlert("Options deleted!", 2000);
        
        dispatch({ type: "CLEAR" });
    }


    var displayedOptions = [...props.options];

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
            displayedOptions = displayedOptions.sort((a, b) => {
                if (b["optionTitle"] > a["optionTitle"])
                    return -1;
                else
                    return 1;
            })
            break;

        case "Vote Count":
            displayedOptions = displayedOptions.sort((a, b) => { return b["votes"] - a["votes"] })
            break;

        case "Order Created": //already sorted in order created
        default:
            break;
    }



    //what to display for settings. Owner sees box to change settings. Other users see which settings, null if none, a box if at least 1 setting
    let settingsDisplay = null;

    if (props.isOwner) {
        settingsDisplay = (
            <div className="bg-slate-600 mt-4 p-3 w-fit mx-auto rounded-xl shadow-md">
                <h1 className='text-white text-2xl mb-2 font-semibold'>Settings</h1>
                <SettingCheckBox ws={props.ws} text="Disable Voting" name="disableVoting" indent={false} pollId={props.pollId} userId={props.userId} active={props.settings["disableVoting"]} />

                <SettingCheckBox ws={props.ws} text="Hide Vote Count" name="hideVotes" indent={false} pollId={props.pollId} userId={props.userId} active={props.settings["hideVotes"]} />

                {props.isOwner && props.settings["hideVotes"] ?
                    <SettingCheckBox ws={props.ws} text="Hide Vote Count For You" name="hideVotesForOwner" indent={true} pollId={props.pollId} userId={props.userId} active={props.settings["hideVotesForOwner"]} />
                    : null}

                <SettingCheckBox ws={props.ws} text="Limit Users To One Vote" name="limitOneVote" indent={false} pollId={props.pollId} userId={props.userId} active={props.settings["limitOneVote"]} />

                <SettingCheckBox ws={props.ws} text="New Options Require Approval" name="approvalRequired" indent={false} pollId={props.pollId} userId={props.userId} active={props.settings["approvalRequired"]} />

                {props.isOwner && props.settings["approvalRequired"] ?
                    <SettingCheckBox ws={props.ws} text="Auto Approve Your Options" name="autoApproveOwner" indent={true} pollId={props.pollId} userId={props.userId} active={props.settings["autoApproveOwner"]} />
                    : null}


                <div className="flex justify-between">
                    <label className="px-1 mr-2 text-red-100" onClick={deleteSelected}>
                        {"Delete Selected Options"}
                    </label>

                    <button onClick={deleteSelected} className="bg-red-200 rounded border border-black h-fit self-center px-2 text-black text-xs">{selectedOptions.length}</button>
                </div>
            </div>)
    } else if (props.settings["disableVoting"] || props.settings["hideVotes"] || props.settings["limitOneVote"] || props.settings["approvalRequired"]) {
        settingsDisplay = (
            <div className="p-4 rounded-xl mx-auto w-fit mt-4 bg-slate-600 shadow-md">
                <h1 className="text-center text-2xl font-semibold pt-1 text-white select-none mb-3">Settings</h1>

                <ul className="text-left">
                    <SettingListDisplay text="Adding and removing votes is disabled" display={props.settings["disableVoting"]} />
                    <SettingListDisplay text="Vote counts are hidden" display={props.settings["hideVotes"]} />
                    <SettingListDisplay text="You may only cast one vote at a time" display={props.settings["limitOneVote"]} />
                    <SettingListDisplay text="New options require approval from the owner" display={props.settings["approvalRequired"]} />
                </ul>
            </div>
        )
    } 


    return ( 
        <>
        {alerts}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center text-center select-none">

            <div className="lg:h-screen overflow-y-auto py-5 bg-slate-700 grid items-center" style = {{
                "boxShadow": "0px 0px 10px 0px rgba(0,0,0,0.5)",
                "zIndex": "1"
            }}>
                <div>
                    <a href="/" className="mx-auto text-5xl block lg:text-7xl font-semibold text-gray-200 select-none">Crowd Poll</a>

                    <input readOnly={true} onClick={(e) => (e.target as HTMLTextAreaElement).select()} className="h-10 w-2/3 lg:w-1/2 rounded mt-4 text-black placeholder:text-black shadow-md bg-slate-300 px-2" value={window.location.toString()} />

                    {settingsDisplay}

                    <Statistics
                        options={props.options}
                        setPieSelected={setPieSelected}
                    />
                </div>

            </div>


            <div className="bg-stone-700 lg:h-screen overflow-y-auto">

                <div className="grid items-center m-5 rounded-xl bg-stone-600/75 py-3 text-3xl bold text-white shadow-lg sticky top-5 z-10 overflow-hidden text-ellipsis">
                    {props.title}
                </div>

                {props.options.length === 0 ?
                    <p className='text-md lg:text-lg mb-10 text-white'>
                        {"No answer options yet, add one below!"}
                    </p>
                    :
                    <div>
                        <Dropdown
                            name="Sort By"
                            show={showSorting}
                            setShow={setShowSorting}
                            method={sortingMethod}

                            children={[
                                <DropdownOption key={"Order Created"} name={"Order Created"} setSortingMethod={setSortingMethod} selected={sortingMethod === "Order Created"} disabled={false} />,
                                <DropdownOption key={"Vote Count"} name={"Vote Count"} setSortingMethod={setSortingMethod} selected={sortingMethod === "Vote Count"}
                                    disabled={(props.settings["hideVotes"] && (!props.isOwner || (props.isOwner && (props.settings["hideVotesForOwner"]))))} />,

                                <DropdownOption key={"Alphabetical Order"} name={"Alphabetical Order"} setSortingMethod={setSortingMethod} selected={sortingMethod === "Alphabetical Order"} disabled={false} />
                            ]}
                        />

                        <Dropdown
                            name="Filter By"
                            show={showFilter}
                            setShow={setShowFilter}
                            method={filterMethod}

                            children={[
                                <DropdownOption key={"All"} name={"All"} setSortingMethod={setFilterMethod} selected={filterMethod === "All"} disabled={false} />,
                                <DropdownOption key={"Voted For"} name={"Voted For"} setSortingMethod={setFilterMethod} selected={filterMethod === "Voted For"} disabled={false} />,
                                <DropdownOption key={"Not Voted For"} name={"Not Voted For"} setSortingMethod={setFilterMethod} selected={filterMethod === "Not Voted For"} disabled={false} />,

                                props.isOwner ?
                                    <DropdownOption key={"Approved"} name={"Approved"} setSortingMethod={setFilterMethod} selected={filterMethod === "Approved"} disabled={false}
                                    /> : null,

                                props.isOwner ?
                                    <DropdownOption key={"Pending Approval"} name={"Pending Approval"} setSortingMethod={setFilterMethod} selected={filterMethod === "Pending Approval"} disabled={!props.settings["approvalRequired"]}
                                    /> : null
                            ]}
                        />
                    </div>}

                <div className='mx-10 my-3 lg:h-fit h-screen'>
                    {displayedOptions.map(obj =>
                        <Option
                            userId={props.userId}
                            pollId={props.pollId}
                            isOwner={props.isOwner}

                            addAlert={addAlert}
                            ws={props.ws}

                            votes={obj["votes"]}
                            optionTitle={obj["optionTitle"]}
                            optionId={obj["_id"]}
                            key={obj["_id"]}

                            voted={props.votedFor.includes(obj["_id"])}
                            pieSelected = {pieSelected === obj["_id"]}

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

        </div>
        </>)

}



export default Poll;
