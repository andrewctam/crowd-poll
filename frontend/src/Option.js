import { useEffect, useState } from 'react'

function Option(props) {
    const [showBox, setShowBox] = useState(false);
    const [selected, setSelected] = useState(false);
    const [voting, setVoting] = useState(false); //allows voting to be responsive even if there is server delay

    useEffect(() => {
        setVoting(false);
        //once an update is received, voting is finished
    }, [props.votedFor])

    const castVote = async (e) => {
        e.preventDefault();

        if (props.disableVoting) {
            alert("Adding and removing votes is currently disabled.")
            return;
        }

        if (!voting) { //if not waiting for the result of this vote
            setVoting(true);

            await props.ws.send(JSON.stringify({
                type: "vote", 
                pollId: props.pollId,
                optionId: props.optionId, 
                userId: props.userId
            }));

        } else { //currently waiting for the result of this vote
            console.log("Wait for vote to finish")
        }

    }

    const approveDenyOption = async (approved) => {
        props.ws.send(JSON.stringify({
            type: "approveDenyOption",
            pollId: props.pollId,
            optionId: props.optionId,
            userId: props.userId,
            approved: approved
        }));
    }

    const toggleSelection = (e) => {
        setSelected(!selected)   
        props.toggleSelected(props.optionId)
    }


    if (!props.approved)
        var color = "bg-red-100"
    else if (selected)
        color = "bg-blue-200"
    else if (voting) 
        color = "bg-emerald-100"
    else if (props.voted)
        color = "bg-green-200"
    else
        color = "bg-slate-300";
    
    if (props.votes >= 0)
        var voteCount = (props.votes) + (props.votes === 1 ? " vote" : " votes");
    else
        voteCount = "Votes Hidden";

    const touchscreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));


    return ((props.approved) ? 
        <button onClick={castVote} onMouseEnter = {() => setShowBox(props.isOwner && true)} onMouseLeave = {() => setShowBox(false)} className={"w-5/6 mx-auto rounded-xl text-black border border-black mb-4 grid items-center " + color}>
            
            <div className="text-lg p-5 w-full relative">
                {props.optionTitle}

                {showBox || selected || (props.isOwner && touchscreen) ? 
                <input type = "checkbox" checked = {selected} className = "absolute top-2 left-2 text-sm p-2 border-black border bg-white w-4 h-4 rounded-xl" 
                    onChange = {toggleSelection} onClick = {(e) => e.stopPropagation()}></input> 
                : null}

            </div>

            <div className="grid-row bg-slate-300/75 border-t border-t-black w-full px-3 py-2 rounded-xl">
                {voteCount}
            </div>
            
        </button>
        :
        <div className={"border w-5/6 mx-auto rounded-xl border-black mb-3 grid items-center " + color}>
            <div className="text-lg p-3"> {props.optionTitle} </div>
            <div className = "text-xl"> {"Pending Approval"} </div>
            <div className = "text-sm mb-2"> {"(only you can see this option)"} </div>

            <div>
                <button onClick = {() => {approveDenyOption(false)}} className="inline border-t border-t-black border-r border-r-black bg-red-300 w-1/2 px-3 py-2 rounded-l-lg">
                    {"Reject"}
                </button>

                <button onClick = {() => {approveDenyOption(true)}} className="inline border-t border-t-black  bg-emerald-300  w-1/2 px-3 py-2 rounded-r-lg">
                    {"Approve"}
                </button>   
            </div>
        </div>
    )

    

}

export default Option