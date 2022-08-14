import { useState } from 'react'

function Option(props) {
    const castVote = async () => {
        console.log("voting")
        const url = "http://localhost:5001/api/polls/vote"

        const updatedVotes = await fetch(url, {
            method: "put",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: props.pollId, optionId: props.optionId, userId: props.userId })
        }) .then( response => {
            if (response.status != 400) {
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
        const url = "http://localhost:5001/api/polls/option"

        const updatedVotes = await fetch(url, {
            method: "put",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: props.pollId, optionId: props.optionId, approved: approved, userId: props.userId })
        }) .then( response => {
            if (response.status != 400) {
                return response.json();
            } else {
                alert("Only 1 vote!")
                return;
            }
        })
      

    }



    const voteCount = props.votes + (props.votes === 1 ? " vote" : " votes");

    if (!props.approved)
        var color = "bg-red-200"
    else if (props.voted)
        color = "bg-emerald-200"
    else
        color = "bg-slate-200";


    return ((props.approved) ? 
        <button onClick={castVote} className={"border w-full rounded-xl border-black mb-3 grid items-center " + color}>
            
            <div className="text-lg p-5">
                {props.optionTitle}

            </div>
            
            <div className="inline border-t border-t-black w-full px-3 py-2 rounded">
                {voteCount}
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
            <button onClick = {() => {approveDenyOption(true)}}className="inline border-t border-t-black border-r border-r-black bg-emerald-300  w-1/2 px-3 py-2 rounded-l-lg">
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