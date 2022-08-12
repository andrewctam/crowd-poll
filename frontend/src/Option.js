import { useState } from 'react'

function Option(props) {
    const [color, setColor] = useState(localStorage.getItem(props.optionId) ? "bg-emerald-300" : "bg-slate-300");

    const incrementVote = async () => {
        localStorage.setItem(props.optionId, "1")
        const url = "http://localhost:5001/api/polls/vote"

        setColor("bg-emerald-300");
        const response = await fetch(url, {
            method: "put",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: props.pollId, optionId: props.optionId })
        })

    }

    const decrementVote = async () => {
        localStorage.removeItem(props.optionId)
        const url = "http://localhost:5001/api/polls/vote"

        setColor("bg-slate-300");
        const response = await fetch(url, {
            method: "delete",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: props.pollId, optionId: props.optionId })
        })

    }


    const castVote = () => {
        if (localStorage.getItem(props.optionId))
            decrementVote();
        else
            incrementVote();
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