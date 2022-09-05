import { useRef, useState, useEffect } from 'react'
import Option from "./Option"
import Dropdown from "./misc/Dropdown"
import SettingCheckBox from './misc/SettingCheckBox';
import SettingListDisplay from './misc/SettingListDisplay';
import DropdownOption from './misc/DropdownOption';

function Poll(props) {
    const optionInput = useRef(null);
    const [showError, setShowError] = useState(false);
    const [votedFor, setVotedFor] = useState(props.defaultVotedFor);
    const [selectedOptions, setSelectedOptions] = useState([]);

    const [sortingMethod, setSortingMethod] = useState("Order Created");
    const [showSorting, setShowSorting] = useState(false);

    const [filterMethod, setFilterMethod] = useState("All");
    const [showFilter, setShowFilter] = useState(false);

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

    
   
    var displayedOptions = [...props.options];

    switch(filterMethod) {
        case "Voted For":
            displayedOptions = displayedOptions.filter( (option) => { 
                return votedFor.includes(option["_id"])
            })
            break;
        case "Not Voted For":
            displayedOptions = displayedOptions.filter( (option) => { 
                return !votedFor.includes(option["_id"]) && option["approved"]
            })
            break;
        case "Approved":
            displayedOptions = displayedOptions.filter( (option) => { 
                    return option["approved"]
                })
            break;
        case "Pending Approval":
            displayedOptions = displayedOptions.filter( (option) => { 
                return !option["approved"]
            })
            break;
        
        case "All":
        default:
            break;   
           
    }

    switch(sortingMethod) {
        case "Alphabetical Order":
            displayedOptions = displayedOptions.sort(  (a, b) => { 
                if (b["optionTitle"] > a["optionTitle"])
                    return -1;
                else
                    return 1;
            } )
            break;
            
        case "Vote Count":
            displayedOptions = displayedOptions.sort(  (a, b) => { return b["votes"] - a["votes"]  } )
            break;

        case "Order Created": //already sorted in order created
        default:
            break;
    }

    
    displayedOptions = displayedOptions.map(obj =>
        <Option
            userId={props.userId}
            pollId={props.pollId}
            isOwner = {props.isOwner}

            votes={obj["votes"]}
            optionTitle={obj["optionTitle"]}
            optionId={obj["_id"]}
            key={obj["_id"]}
            
            voted = {votedFor.includes(obj["_id"])}
            setVotedFor = {setVotedFor}

            approved = {!props.settings["approvalRequired"] || obj["approved"]}
            toggleSelected = {toggleSelected}
            disableVoting = {props.settings["disableVoting"]}
         />);

    

    //what to display for settings. Owner sees box to change settings. Other users see which settings, null if none, a box if at least 1 setting
    if (props.isOwner) {
        var settingsDisplay = (
            <div className = "border border-white mt-4 p-3 w-fit mx-auto rounded-xl">
                <h1 className='text-white text-2xl mt-1 font-semibold'>Settings</h1>
                <p className='text-white mb-3'> {"(only you can edit these)"} </p>

                <SettingCheckBox text = "Disable Voting" name = "disableVoting" indent = {false} pollId = {props.pollId} userId = {props.userId} active= {props.settings["disableVoting"]} />

                <SettingCheckBox text = "Hide Vote Count" name = "hideVotes" indent = {false} pollId = {props.pollId} userId = {props.userId} active = {props.settings["hideVotes"]} />

                {props.isOwner && props.settings["hideVotes"] ?
                <SettingCheckBox text = "Hide Vote Count For You" name = "hideVotesForOwner" indent = {true} pollId = {props.pollId} userId = {props.userId} active = {props.settings["hideVotesForOwner"]} />
                : null}

                <SettingCheckBox text = "Limit Users To One Vote" name = "limitOneVote" indent = {false} pollId = {props.pollId} userId = {props.userId} active = {props.settings["limitOneVote"]} />

                <SettingCheckBox text= "New Options Require Approval" name = "approvalRequired" indent = {false} pollId = {props.pollId} userId = {props.userId} active = {props.settings["approvalRequired"]} />
                
                {props.isOwner && props.settings["approvalRequired"] ?
                <SettingCheckBox text = "Auto Approve Your Options" name = "autoApproveOwner" indent = {true} pollId = {props.pollId} userId = {props.userId} active = {props.settings["autoApproveOwner"]} />   
                : null}
                

                <div className = "flex justify-between">
                    <label className = "px-1 mr-2 text-white" onClick = {deleteSelected}>
                        {"Delete Selected Options"}
                    </label>
                    
                    <button onClick = {deleteSelected} className = "bg-red-100 rounded border border-black h-fit self-center px-2 text-black text-xs">{selectedOptions.length}</button>
                </div> 
        </div>)
        } else if (props.settings["disableVoting"] || props.settings["hideVotes"] || props.settings["limitOneVote"] || props.settings["approvalRequired"]) {
            settingsDisplay = (
                <div className = "border border-white p-4 rounded-xl mx-auto w-fit mt-4">
                        <h1 className="text-center text-2xl font-semibold pt-1 text-white select-none mb-3">Settings</h1>

                        <ul className = "text-left">
                            <SettingListDisplay text = "Adding and removing votes is disabled"  display = {props.settings["disableVoting"]} />
                            <SettingListDisplay text = "Vote counts are hidden"  display = {props.settings["hideVotes"]} />
                            <SettingListDisplay text = "You may only cast one vote at a time"  display = {props.settings["limitOneVote"]}/>
                            <SettingListDisplay text = "New options require approval from the owner"  display = {props.settings["approvalRequired"]}/>
                        </ul>
                    </div>
            )
        } else
            settingsDisplay = null;
    

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center text-center select-none">
            
            <div className="lg:h-screen flex flex-col">
                <div className="py-10 bg-slate-700">
                    <a href="." className="mx-auto text-5xl lg:text-7xl font-semibold text-gray-200 select-none">Crowd Poll</a>
                    
                    <h1 className="lg:text-xl pt-1 text-white select-none">Link to the poll:</h1>
                    <input readOnly={true} onClick={(e) => e.target.select()} className="h-10 w-2/3 rounded text-black lg:text-lg placeholder:text-black bg-slate-200 px-2 border border-black" value={window.location} />

                    {settingsDisplay}
                    
                    <div className='text-sm lg:text-lg text-white mt-4'>
                        {"Click on an option to add or remove your vote"}
                    </div>
                        <div className='text-sm lg:text-lg text-white'>
                        {"You can " + (props.settings["approvalRequired"] ? "request to " : "") + "add more options using the input below"}
                    </div>
                </div>

                <div className = "flex-grow bg-slate-600 p-10 flex items-center justify-center">
                    <form onSubmit={addOption} className = "w-full">
                        <h1 className="mx-auto text-xl lg:text-2xl text-gray-200 select-none px-4 mb-2">Add Answer Option</h1>
                        <input ref={optionInput}  className="h-10 w-3/4 lg:w-1/2 rounded text-black lg:text-lg placeholder:text-black bg-slate-200 p-2 border border-black" placeholder="Enter an option..." />
                        <button type="submit" className="bg-black text-gray-200 border border-black p-2 m-2 rounded" >{props.settings["approvalRequired"] ? "Request To Add Option" : "Add Option"}</button>
                        {showError ? <p className="m-1 text-red-300">Option can not be blank. Please enter some text.</p> : null}
                    </form>
               </div>
            </div>


            <div className="bg-stone-600 lg:h-screen overflow-y-auto">
                <div className="grid items-center bg-stone-700 py-8 text-3xl mb-4 bold text-white">
                    {props.title}
                </div>                

                {props.options.length === 0 ? 
                    <p className='text-md lg:text-lg text-white'>
                        {"No answer options yet, add one using the input!"}
                    </p> 
                    :
                    <div>
                        <Dropdown 
                            name = "Sort By"
                            show = {showSorting}
                            setShow = {setShowSorting}
                            selected = {sortingMethod}

                            children = {[
                                <DropdownOption name = {"Order Created"} setSortingMethod = {setSortingMethod} selected = {sortingMethod === "Order Created"} disabled = {false} />,
                                <DropdownOption name = {"Vote Count"} setSortingMethod = {setSortingMethod} selected = {sortingMethod === "Vote Count"} 
                                    disabled = {(props.settings["hideVotes"] && (!props.isOwner || (props.isOwner && (props.settings["hideVotesForOwner"]))))}/>,
                                    
                                <DropdownOption name = {"Alphabetical Order"} setSortingMethod = {setSortingMethod} selected = {sortingMethod === "Alphabetical Order"} disabled = {false}/>
                            ]} 
                        />
                               
                        <Dropdown 
                            name = "Filter By"
                            show = {showFilter}
                            setShow = {setShowFilter}
                            selected = {filterMethod}
                            
                            children = {[
                                <DropdownOption key = {"All"} name = {"All"} setSortingMethod = {setFilterMethod} selected = {filterMethod === "All"} disabled = {false}/>,
                                <DropdownOption key = {"Voted For"} name = {"Voted For"} setSortingMethod = {setFilterMethod} selected = {filterMethod === "Voted For"} disabled = {false}/>,
                                <DropdownOption key = {"Not Voted For"} name = {"Not Voted For"} setSortingMethod = {setFilterMethod} selected = {filterMethod === "Not Voted For"} disabled = {false}/>,

                                props.isOwner ? 
                                <DropdownOption key = {"Approved"} name = {"Approved"} setSortingMethod = {setFilterMethod} selected = {filterMethod === "Approved"} disabled = {false}
                                /> : null,

                                props.isOwner ? 
                                <DropdownOption key = {"Pending Approval"} name = {"Pending Approval"} setSortingMethod = {setFilterMethod} selected = {filterMethod === "Pending Approval"} disabled = {!props.settings["approvalRequired"]}
                                /> : null
                            ]}
                        />
                    </div>}                

                <div className='mx-10 my-3 lg:h-fit h-screen'>
                    {displayedOptions}
                </div>
                
            </div>

        </div>)

}



export default Poll;
