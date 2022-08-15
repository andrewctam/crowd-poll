import { useRef, useState } from 'react'
import Option from "./Option"
import Alert from './Alert';

function Poll(props) {
    const optionInput = useRef(null);
    const [showError, setShowError] = useState(false);
    const [votedFor, setVotedFor] = useState(props.defaultVotedFor);
    const [approveSelf, setApproveSelf] = useState(true);
    const addOption = async (e) => {
        e.preventDefault();

        const url = "https://crowd-poll.herokuapp.com/api/polls/option"
        const optionTitle = optionInput.current.value

        if (optionTitle === "") {
            setShowError(true);
            return;
        } else {
            setShowError(false);
        }
        

        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({optionTitle: optionTitle, id: props.id, userId: approveSelf ? props.userId : ""})
        })

        optionInput.current.value = "";
    }

    const setSetting = async (e) => {
        const setting = e.target.id;
        const newValue = e.target.checked;

        const url = "https://crowd-poll.herokuapp.com/api/polls/setting"
        
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pollId: props.id,
                userId: props.userId,
                setting: setting,
                newValue: newValue

            })
        })

    } 

    //var sorted = props.options//.sort(  (a, b) => { return b["votes"] - a["votes"]  } )
    const options = props.options.map(obj =>
        <Option
            key={obj["_id"]}
            pollId={props.id}
            votes={obj["votes"]}
            optionTitle={obj["optionTitle"]}
            optionId={obj["_id"]}
            userId = {props.userId}
            setVotedFor = {setVotedFor}
            voted = {votedFor.includes(obj["_id"])}
            approved = {!props.settings["approvalRequired"] || obj["approved"]}
         />);

    
    //console.log(props.settings)
    return (

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center text-center">
            

            <div className="lg:h-screen flex flex-col">
                <div className="mt-2 py-10">
                    <a href="." className="mx-auto text-7xl font-bold text-gray-200 select-none">Crowd Poll</a>
                    <h1 className="text-xl pt-1 text-white select-none">Link to the poll:</h1>
                    <input readOnly={true} onClick={(e) => e.target.select()} className="h-10 md:w-1/2 w-3/4 rounded text-black text-lg placeholder:text-black bg-slate-200 px-2 border border-black" value={window.location} />

                    {props.isOwner ? 
                    <div className = "border border-white mt-4 p-2 w-fit mx-auto rounded-xl">
                        <h1 className='text-white text-2xl mt-1 bold'>Settings</h1>
                        <p className='text-white mb-3'>{"(only you can edit these)"}</p>

                        <div className = "text-white text-right">
                            <label className = "px-1" htmlFor="limitOneVote" >Limit Respondents To One Vote</label>
                            <input id="limitOneVote" type="checkbox" onChange = {setSetting} checked = {props.settings["limitOneVote"]}></input>
                        </div>

                        <div className = "text-white text-right">
                            <label className = "px-1" htmlFor="approvalRequired" >New Options Require Your Approval</label>
                            <input id="approvalRequired" type="checkbox" onChange = {setSetting} checked = {props.settings["approvalRequired"]}></input>
                        </div>
                    </div> : null}

                </div>

                <div className = "flex-grow bg-slate-600 p-10 mt-4 flex items-center justify-center">
                    <form  onSubmit={addOption} className = "w-full">
                        <input ref={optionInput}  className="h-10 md:w-1/2 w-3/4 rounded text-black text-lg placeholder:text-black bg-slate-200 p-2 border border-black" placeholder="Enter an option..." />
                        <br />
                        {showError ? <p className="m-1 text-red-300">Option can not be blank. Please enter some text.</p> : null}
                        <button type="submit" className="bg-black text-gray-200 border border-black p-2 m-2 rounded" >{props.settings["approvalRequired"] ? "Request To Add Option" : "Add Option"}</button>


                        {props.isOwner && props.settings["approvalRequired"] ?
                        <div className = "text-white text-center">
                            <label className = "px-1" htmlFor="approveSelf" >Auto Approve Your Own Options</label>
                            <input id="approveSelf" type="checkbox" onChange = {() => {setApproveSelf(!approveSelf)}} checked = {approveSelf}></input>
                        </div> 
                        : null
                        } 
                    </form>
                </div>
            </div>



            <div className="bg-slate-500 lg:h-screen p-10 overflow-y-auto">
                
                <div className="p-5 text-3xl bold text-white">{props.title}</div>                

                <p className='text-xl bold text-white mb-2'>
                    {options.length !== 0 ? 
                        "Click to vote! Click again to remove your vote."
                        :
                        "No answer options yet, add one using the input to the left!"
                    }
                </p> 

                <div>
                    {options}
                </div>

            </div>


        </div>)







}

export default Poll