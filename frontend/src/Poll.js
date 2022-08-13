import { useRef, useState } from 'react'
import Option from "./Option"


function Poll(props) {
    const optionInput = useRef(null);
    const [votedFor, setVotedFor] = useState(props.defaultVotedFor);

    const addOption = async (e) => {
        e.preventDefault();

        const url = "https://grouppoll.herokuapp.com/api/polls/option"
        const optionTitle = optionInput.current.value

        if (optionTitle === "") {
            alert("Enter title")
            return;
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({optionTitle: optionTitle, id: props.id, userId: props.userId })
        })

        optionInput.current.value = "";
    }

    const setSetting = async (e) => {
        const setting = e.target.id;
        const newValue = e.target.checked;

        const url = "https://grouppoll.herokuapp.com/api/polls/setting"
        
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
            approved = {obj["approved"]}
         />);

    
    //console.log(props.settings)
    return (

        <div className="grid md:grid-cols-1 lg:grid-cols-2 items-center text-center">

            <div className="py-10" >
                <a href="/"><h1 className="mx-auto text-7xl font-bold text-gray-200 select-none">Group Poll</h1></a>

                <div className="mt-2">
                    <h1 className="text-xl pt-1 text-gray-300 select-none">Share this link to your poll:</h1>
                    <input readOnly={true} onClick={(e) => e.target.select()} className="h-10 w-96 rounded text-black text-lg placeholder:text-black bg-slate-200 px-2 border border-black" value={window.location} />

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
                        

                        
                        
                      
                    </div>

                    : null}


                </div>
            </div>


            <div className="bg-slate-600 lg:h-screen">

                <div className="tp-10 bg-slate-600 h-2/6">
                    <div className="text-3xl bold p-5 text-white">{props.title}</div>

                    <form className="py-10 " onSubmit={addOption}>
                        <input ref={optionInput} required={true} className="h-10 w-96 rounded text-black text-lg placeholder:text-black bg-slate-200 p-2 border border-black" placeholder="Enter an option..." />
                        <br />
                        <button type="submit" className="bg-black text-gray-200 border border-black p-2 m-2 rounded" >Add Option</button>

                    </form>

                </div>

                <div className="h-4/6 overflow-y-auto px-5 py-2 bg-slate-500">
                    {options.length === 0 ? null :
                        <p className='text-xl bold text-white mb-2'>Click to vote! Click again to remove your vote.</p>
                    }
                    {options}
                </div>


            </div>



        </div>)







}

export default Poll