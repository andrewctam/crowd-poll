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

        //check for settings to avoid sending unnecessary requests that would be rejected
        if (props.disableVoting) {
            alert("Adding and removing votes is currently disabled.")
            return;
        }

        if (props.limitOneVote && !props.voted && props.votedFor.length > 0) {
            alert("You can only vote for one option.")
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

    let style = {
        borderColor: "rgb(255, 255, 255)"
    };

    if (!props.approved)
        style["borderColor"] = "rgb(255, 0, 0)"
    else if (selected)
        style["borderColor"] = "rgb(255 127 127)"
    else if (voting)
        style["borderColor"] = "rgb(200 236 180)"
    else if (props.voted)
        style["borderColor"] = "rgb(154 236 180)"

    if (props.pieSelected)
        style["transform"] = "scale(1.1)"

    if (props.voted)
        style["backgroundImage"] = "linear-gradient(to right, rgb(89 100 90), rgb(92 92 90))"


    const touchscreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

    if (props.approved)
        return (<button
            onClick={castVote}
            onMouseEnter={() => setShowBox(props.isOwner && true)}
            onMouseLeave={() => setShowBox(false)}
            className={`w-5/6 mx-auto rounded-xl text-white border-l-4 mb-4 grid items-center bg-slate-400/10 py-3`}
            style={style}
        >

            <div className="text-xl px-10 relative text-left text-ellipsis overflow-hidden">
                {props.optionTitle}

                {showBox || selected || (props.isOwner && touchscreen) ?
                    <input type="checkbox" checked={selected} className="absolute top-0 left-2 text-sm w-4 h-4 rounded-xl"
                        onChange={toggleSelection} onClick={(e) => e.stopPropagation()}></input>
                    : null}

            </div>

            <div className="grid-row w-full px-10 rounded-xl text-left">
                {props.votes >= 0 ?
                    `${props.votes} ${props.votes === 1 ? "vote" : "votes"}`
                    :
                    "Votes Hidden"
                }

            </div>

        </button>)
    else
        return (

            <div className={`w-5/6 mx-auto rounded-xl text-white border-l-4 border-rose-300 mb-4 py-3 grid items-center bg-gradient-to-r from-rose-400/10 via-rose-400/20 to-slate-400/10`}>

                <div className="text-xl px-10 w-full relative text-left">
                    {props.optionTitle}
                </div>
                <div className="px-10 w-full relative text-left text-sm">
                    {"Pending Approval. Only you can see this option."}
                </div>

                <div className="grid-row px-10 rounded-xl text-left text-sm mt-2">
                    <button onClick={() => { approveDenyOption(false) }} className="inline bg-rose-300/25 text-white w-1/2 px-3 py-2 rounded-l-lg">
                        {"Reject"}
                    </button>

                    <button onClick={() => { approveDenyOption(true) }} className="inline bg-emerald-400/25 text-white w-1/2 px-3 py-2 rounded-r-lg">
                        {"Approve"}
                    </button>


                </div>

            </div>

        )



}

export default Option