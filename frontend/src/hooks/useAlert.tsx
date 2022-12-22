import { useMemo, useState, useReducer } from "react";

export interface Alert {
    index: number
    msg: string
    alert: JSX.Element
    timeout: NodeJS.Timeout
}

export type AlertAction = 
    { type: "ADD_ALERT", payload: { msg: string, time: number, type: string } } |
    { type: "REMOVE_ALERT_BY_INDEX", payload: { id: number } } |
    { type: "REMOVE_ALERT_BY_MSG", payload: { msg: string } }
    

const useAlert = (): [JSX.Element, React.Dispatch<AlertAction> ] => {
    const [count, setCount] = useState(0);

    const createAlert = ((msg: string, time: number, type: string): Alert => {
        const timeout = setTimeout(() => {
            alertDispatch({ type: "REMOVE_ALERT_BY_INDEX", payload: { "id": count } })
        }, time)

        const alert = (
            <div
                key={`alert${count}`}
                className={`rounded px-4 py-3 w-fit h-fit p-5 m-2 text-black z-20 shadow-md ${type === "error" ? "bg-rose-300" : "bg-sky-200"}`}
                onClick={() => {
                    alertDispatch({ type: "REMOVE_ALERT_BY_INDEX", payload: { "id": count } })
                }}>

                <p>{msg}</p>
            </div>
        )

        setCount(count + 1);


        return {
            index: count,
            msg: msg,
            alert: alert,
            timeout: timeout
        };

    })
    
    const reducer = (state: Alert[], action: AlertAction) => {
        switch (action.type) {
            case "ADD_ALERT": {
                let newAlert = createAlert(action.payload.msg, action.payload.time, action.payload.type)
                return [...state, newAlert];
            }
            case "REMOVE_ALERT_BY_INDEX": {
                let alert = state.find(alert => alert.index === action.payload.id);
                if (alert) {
                    clearTimeout(alert.timeout);
                    return state.filter(alert => alert.index !== action.payload.id);
                }

                return state;
            }
            case "REMOVE_ALERT_BY_MSG": {
                let alert = state.find(alert => alert.msg === action.payload.msg);
                if (alert) {
                    clearTimeout(alert.timeout);
                    return state.filter(alert => alert.msg !== action.payload.msg);
                }

                return state;
            }
            default:
                return state;
        }
    }

    const [alerts, alertDispatch] = useReducer(reducer, []);

    const alertContainer = useMemo(() => {
        return <div className="fixed top-0 left-0 m-1 z-20">
            {alerts.map((alert: Alert) => alert.alert)}
        </div>
    }, [alerts]);


    return [alertContainer, alertDispatch];

}

export default useAlert;