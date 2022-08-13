import { useState } from 'react'

function Option(props) {
    const [color, setColor] = useState("bg-slate-50");

    const castVote = async () => {
        const url = "http://localhost:5001/api/polls/vote"

        const voted = await fetch(url, {
            method: "put",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: props.pollId, optionId: props.optionId, userId: props.userId })
        }) .then( response => {
            if (response.status != 400) {
                return response.json();
                
            } else {
                console.log("Only 1 vote!")
                return;
            }

            
        })
        
        props.setVotedFor(voted)

    }


    const voteCount = props.votes + (props.votes === 1 ? " vote" : " votes");

    return <button onClick={castVote} className={"border w-full rounded-xl border-black mb-3 grid items-center " + color}>
        <div className="text-lg p-5">
            {props.optionTitle}

        </div>

        <div className="inline border-t border-t-black w-full px-3 py-2 rounded">
            {voteCount}
        </div>


    </button>



}

export default Option