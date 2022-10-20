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


    if (!props.approved)
        var color = "rgb(255, 0, 0)"
    else if (selected)
        color = "rgb(255 127 127)"
    else if (voting)
        color = "rgb(200 236 180)"
    else if (props.voted)
        color = "rgb(154 236 180)"
    else
        color = "rgb(255, 255, 255)";

    if (props.votes >= 0)
        var voteCount = (props.votes) + (props.votes === 1 ? " vote" : " votes");
    else
        voteCount = "Votes Hidden";

    const touchscreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));


    if (props.approved)
        return (<button
            onClick={castVote}
            onMouseEnter={() => setShowBox(props.isOwner && true)}
            onMouseLeave={() => setShowBox(false)}
            className={`w-5/6 mx-auto rounded-xl text-white border-l-4 mb-4 grid items-center bg-slate-400/10 py-3`}
            style={{ borderColor: color, backgroundImage: props.voted ? "linear-gradient(to right, rgb(89 110 90), rgb(92 92 90))" : "" }}
        >

            <div className="text-xl px-10 relative text-left text-ellipsis overflow-hidden">
                {props.optionTitle}

                {showBox || selected || (props.isOwner && touchscreen) ?
                    <input type="checkbox" checked={selected} className="absolute -top-1 left-2 text-sm w-4 h-4 rounded-xl"
                        onChange={toggleSelection} onClick={(e) => e.stopPropagation()}></input>
                    : null}

            </div>

            <div className="grid-row w-full px-10 rounded-xl text-left">
                {voteCount}
            </div>

        </button>)
    else
        return (

            <div className={`w-5/6 mx-auto rounded-xl text-white border-l-4 border-rose-300 mb-4 grid items-center bg-slate-400/10 py-3`}>

                <div className="text-xl px-10 w-full relative text-left">
                    {props.optionTitle}
                </div>
                <div className="px-10 w-full relative text-left text-sm">
                    {"Pending Approval. Only you can see this option."}
                </div>

                <div className="grid-row px-10 rounded-xl text-left text-black text-sm">
                    <button onClick={() => { approveDenyOption(true) }} className="inline border-t border-t-black bg-emerald-100  w-1/2 px-3 py-2 rounded-l-lg">
                        {"Approve"}
                    </button>

                    <button onClick={() => { approveDenyOption(false) }} className="inline border-t border-t-black border-l border-l-black bg-rose-100 w-1/2 px-3 py-2 rounded-r-lg">
                        {"Reject"}
                    </button>


                </div>

            </div>

        )



}

export default Option