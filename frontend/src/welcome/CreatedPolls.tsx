import { useEffect, useState } from "react";
import CreatedBox from "./CreatedBox";
import { AlertAction } from "../hooks/useAlert";

export type Polls = { [pollId: string]: string };

interface CreatedPollsProps {
    userId: string,
    alertDispatch: React.Dispatch<AlertAction>
}

function CreatedPolls(props: CreatedPollsProps) {
    const [selected, setSelected] = useState<string[]>([]);
    const [allSelected, setAllSelected] = useState(false);

    useEffect(() => {
        if (allSelected) {
            const createdPolls = localStorage.getItem("created")
            if (!createdPolls)
                return;

            const polls: Polls = JSON.parse(createdPolls);

            setSelected(Object.keys(polls));
        } else
            setSelected([]);
    }, [allSelected])


    const toggleSelected = (e: React.FormEvent<HTMLInputElement>) => {
        const id = (e.target as HTMLInputElement).id

        for (let i = 0; i < selected.length; i++)
            if (selected[i] === id) {
                const temp = [...selected];
                temp.splice(i, 1);
                setSelected(temp);
                return;
            }

        setSelected([...selected, id]);

    }


    const deletePolls = async () => {
        const pollIds = selected.join(".");
        setAllSelected(false);
        if (pollIds) {
            const url = `${process.env.NODE_ENV !== "production" ? process.env.REACT_APP_DEV_HTTP_URL : process.env.REACT_APP_PROD_HTTP_URL}/api/polls/delete`
            await fetch(url, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pollIds: pollIds, userId: props.userId })
            }).then(response => response.json());

            //this should find data unless the user deletes it for some reason
            const createdPolls = localStorage.getItem("created")

            if (createdPolls) {
                const trimmed: Polls = JSON.parse(createdPolls);

                selected.forEach((id) => {
                    delete trimmed[id]
                })

                if (Object.keys(trimmed).length === 0)
                    localStorage.removeItem("created")
                else
                    localStorage.setItem("created", JSON.stringify(trimmed));
            }

            props.alertDispatch({
                type: "ADD_ALERT", payload: {
                    msg: "Polls Deleted",
                    time: 2000,
                    type: "success"
                }
            })

            setSelected([])

        }
    }


    const createdPolls = localStorage.getItem("created")
    if (!createdPolls) {
        return null;
    }

    const polls: Polls = JSON.parse(createdPolls);
    
    return (
        <div className="bg-stone-600 h-fit w-5/6 mx-auto p-6 mt-8 rounded-xl shadow-xl">
            <p className="text-xl lg:text-2xl mb-4 select-none px-4 text-white">
                Your Created Polls
            </p>

            <ul className="overflow-y-auto mx-auto w-fit px-6">
                <li key="selectAll" className="h-fit flex justify-between">
                    <label htmlFor="selectAll" className="text-gray-300 select-none">
                        Select All
                    </label>
                    <input id="selectAll" 
                        checked={allSelected} 
                        onChange={() => { setAllSelected(!allSelected) }} 
                        className="border border-black ml-32" 
                        type="checkbox" 
                    />
                </li>
                
                {Object.keys(polls).reverse().map((id) =>
                    <CreatedBox
                        id={id}
                        key={id}
                        title={polls[id]}
                        toggleSelected={toggleSelected}
                        selected={selected.includes(id)}
                        checked={selected.includes(id)}
                    />)
                }
            </ul>

            {selected.length > 0 ? 
                <div className="mt-4">
                    <label className="text-red-100" onClick={deletePolls}>
                        {"Delete Selected Polls"}
                    </label>

                    <button 
                        onClick={deletePolls}
                        className="bg-red-200 rounded border border-black ml-2 px-2 text-black text-xs self-center">
                        {selected.length}
                    </button>
                </div>
            : null}
        </div>
    )
}

export default CreatedPolls;