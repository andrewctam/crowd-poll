import { useState } from 'react'

function Option(props) {
    const [showBox, setShowBox] = useState(false);
    const [selected, setSelected] = useState(false);
    
    const castVote = async (e) => {
        
        console.log("voting")
        const url = "https://crowd-poll.herokuapp.com/api/polls/vote"

        const updatedVotes = await fetch(url, {
            method: "put",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                pollId: props.pollId,
                optionId: props.optionId,
                userId: props.userId })
        }).then( response => {
            if (response.status !== 400) {
                return response.json();
            } else {
                alert("Only 1 vote!")
                return;
            }
        })
        
        if (updatedVotes)
            props.setVotedFor(updatedVotes)

    }

    const approveDenyOption = async (approved) => {
        
        const url = "https://crowd-poll.herokuapp.com/api/polls/option"

         await fetch(url, {
            method: "put",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                pollId: props.pollId,
                optionId: props.optionId,
                approved: approved,
                userId: props.userId 
            })

        }).then( response => {
            if (response.status !== 400) {
                return response.json();
            } else {
                alert("Only 1 vote!")
                return;
            }
        })
      
        return;

    }

    const toggleSelection = (e) => {
        setSelected(!selected)   
        props.toggleSelected(props.optionId)
    }



    
    
    if (!props.approved)
        var color = "bg-red-100"
    else if (selected)
        color = "bg-blue-200"
    else if (props.voted)
        color = "bg-green-200"
    else
        color = "bg-slate-200";
    
    
    const voteCount = props.votes + (props.votes === 1 ? " vote" : " votes");
    const touchscreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    
    return ((props.approved) ? 
        <button onClick={castVote} onMouseEnter = {() => setShowBox(props.isOwner && true)} onMouseLeave = {() => setShowBox(false)} className={"border w-full rounded-xl border-black mb-3 grid items-center " + color}>
            
            <div className="text-lg p-5 w-full relative">
                {props.optionTitle}

                {showBox || selected || (props.isOwner && touchscreen) ? 
                <input type = "checkbox" checked = {selected} className = "absolute top-2 left-2 text-black text-sm p-2 border-black border bg-white w-4 h-4 rounded" 
                    onChange = {toggleSelection} onClick = {(e) => e.stopPropagation()}></input> 
                : null}

            </div>


            <div className="grid-row border-t border-t-black w-full px-3 py-2 rounded">
                {props.votes >= 0 ? voteCount : "Votes Hidden"}
            </div>
            
        </button>
        :
        <div className={"border w-full rounded-xl border-black mb-3 grid items-center " + color}>
            
            <div className="text-lg p-5">
                {props.optionTitle}
            </div>
            <div className = "mb-1">
                {"Pending Approval (only you can see this option)"}
            </div>

            <div>
                <button onClick = {() => {approveDenyOption(true)}} className="inline border-t border-t-black border-r border-r-black bg-emerald-300  w-1/2 px-3 py-2 rounded-l-lg">
                    Approve
                </button>   

                <button onClick = {() => {approveDenyOption(false)}} className="inline border-t border-t-black bg-red-300 w-1/2 px-3 py-2 rounded-r-lg">
                    Reject
                </button>
            </div>
    
      
        </div>
    )

    

}

export default Option