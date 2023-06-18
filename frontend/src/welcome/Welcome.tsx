import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AlertAction } from "../hooks/useAlert";
import CreatedPolls, { Polls } from "./CreatedPolls";

interface WelcomeProps {
    userId: string
    verifyId: () => void
    alertDispatch: React.Dispatch<AlertAction>
    setPollId: (str: string) => void
}

function Welcome(props: WelcomeProps) {
    const [titleInput, setTitleInput] = useState("");
    const [showError, setShowError] = useState(false);

    const navigate = useNavigate();

    const createPoll = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (titleInput === "") {
            setShowError(true);
            return;
        }

        const url = `${process.env.NODE_ENV !== "production" ? process.env.REACT_APP_DEV_HTTP_URL : process.env.REACT_APP_PROD_HTTP_URL}/api/polls/create`
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: titleInput, userId: props.userId })
        }).then((response) => {

            if (response.status === 404)
                return 404;
            else
                return response.json()

        });

        if (response === 404) {
            props.verifyId();
            return;
        }

        if (!response["pollId"]) {
            console.log("Error creating poll");
            return;
        }

        props.setPollId(response["pollId"]); //calls getPoll after useEffect
        navigate(`/poll?id=${response["pollId"]}`)


        const createdPolls = localStorage.getItem("created")

        if (createdPolls) {
            const temp: Polls = JSON.parse(createdPolls)

            temp[response["pollId"]] = titleInput;
            localStorage.setItem("created", JSON.stringify(temp));
        } else {
            localStorage.setItem("created", JSON.stringify({
                [response["pollId"]]: titleInput
            }));
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-center text-center">

            <div className="py-10 bg-slate-700 h-full w-full grid items-center" style={{
                "boxShadow": "0px 0px 10px 0px rgba(0,0,0,0.5)",
                "zIndex": "1"
            }}>
                <div>
                    <a href=".">
                        <h1 className="mx-auto text-5xl lg:text-6xl font-semibold text-gray-200 select-none px-4">
                            Crowd Poll
                        </h1>
                    </a>

                    <p className="text-sm lg:text-xl pt-1 mt-2 text-gray-300 select-none">
                        Share a poll with a title <br />
                        Crowd source answer options <br />
                        Collectively vote on the best one
                    </p>
                </div>
            </div>


            <div className="bg-stone-700 flex lg:h-screen w-full overflow-auto">
                <div className="w-full my-auto pb-4">
                    <form className="p-10 py-4 bg-stone-600 shadow-xl rounded-xl mt-5 h-fit w-5/6 mx-auto" onSubmit={createPoll}>
                        <h1 className="mx-auto text-xl lg:text-2xl text-gray-200 select-none px-4">Create New Poll</h1>

                        <input
                            value={titleInput}
                            onChange={(e) => {
                                setTitleInput(e.target.value)
                                setShowError(false)
                            }}
                            className={`h-10 w-3/5 rounded text-white text-lg  focus:outline-none bg-stone-500 px-2 shadow-md ${showError ? "placeholder:text-red-300" : "placeholder:text-white/90"}`}
                            placeholder={`${showError ? "Title can not be blank" : "Enter a title..."}`} />

                        <button type="submit" disabled={props.userId === ""} className="bg-black text-gray-200 border border-black p-2 m-2 rounded">Create Poll</button>

                        <p className="text-white mt-1 select-none">You can add answer options and edit settings once inside the poll</p>

                        {props.userId ?
                            <div className="select-none text-green-100 mt-4">
                                Connected to Server
                            </div>
                            :
                            <div className="select-none text-rose-100 mt-4">
                                Connecting to Server...
                            </div>
                        }

                    </form>

                    <CreatedPolls
                        userId={props.userId}
                        alertDispatch={props.alertDispatch}
                    />
                </div>
            </div>
        </div>
    );
}

export default Welcome
