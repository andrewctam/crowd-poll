import React, { useEffect } from "react";

function Alert(props) {

    useEffect( () =>  { 
        const timer = setTimeout(() => {
            props.setAlert(null);
        }, props.timeout);

        return () => clearTimeout(timer);

    // eslint-disable-next-line
    }, []);


    return <div className = "w-4/5 m-auto" >
            <div className="bg-red-200 text-black font-bold rounded-t px-4 py-2">
                {props.title}
            </div>

            <div className="rounded-b bg-red-100 px-4 py-3 text-red-800">
                <p>{props.message}</p>
            </div>
        </div>
}
export default Alert;
