import { useReducer, useEffect } from "react";



const useAlert = () => {
    const createAlert = ((msg, id, time, type = "success") => {
        const alert = (

                <div className={`rounded border border-black px-4 py-3 w-fit h-fit p-5 m-2 text-black ${type === "error" ? "bg-rose-300" : "bg-sky-200"}`}>
                    <p>{msg}</p>
                </div>
            )


        const timeout = setTimeout(() => {
            dispatch({ type: "REMOVE_ALERT", payload: {"id": id} })
        }, time)

        return {
            index: id,
            alert: alert,
            timeout: timeout
        };

    })

    const reducer = (state, action) => {
        switch (action.type) {
            case "ADD_ALERT":
                return [...state, createAlert(action.payload.msg, state.length, action.payload.time, action.payload.type)];

            case "REMOVE_ALERT":
                const alert = state.find(alert => alert.index === action.payload.id);
                if (alert) {
                    clearTimeout(alert.timeout);
                    return state.filter(alert => alert.index !== action.payload.id);
                }

                return state;

            default:
                return state;
        }
    }

    const [alerts, dispatch] = useReducer(reducer, []);

    const alertContainer = (
        <div className="fixed top-0 left-0 m-1">
            {alerts.map(alert => alert.alert)}
        </div>
    )

    const addAlert = (msg, time, type) => {
        dispatch({ type: "ADD_ALERT", payload: { msg: msg, time: time, type: type } })
    }

    return [alertContainer, addAlert];



}

export default useAlert;