import react, {useState} from 'react'

function Option(props) {
    const incrementVote = async (e) => {    
        const url = "http://localhost:5001/api/polls/vote"

        const response = await fetch(url, {
          method: "put",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({id: props.pollId, optionId: props.optionId})
        })   
        .then(props.getPoll());   
    
    
    
    }


    const voteCount = props.votes + (props.votes === 1 ? " vote" : " votes");
    return <div className = "border rounded-lg bg-slate-300 border-black p-5 my-2 grid grid-flow-co items-center">
        <div className = "col-span-1 w-fu;;">
            <button onClick = {incrementVote} className='border border-black p-1 rounded bg-slate-50'>Vote</button>
            <div className=''>{voteCount}</div>
        </div>

        <div className = "col-span-4 w-full">{props.optionTitle}</div>
    </div>
    

    
}

export default Option