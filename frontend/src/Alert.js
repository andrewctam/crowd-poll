import React, { useEffect } from "react";

function Alert(props) {

    useEffect( () =>  { 
        const timer = setTimeout(() => {
            props.setAlert(null);
        }, props.timeout);

        return () => clearTimeout(timer);

    }, []);



    return <div className = "lg:absolute lg:top-0 m-5" >
    <div class="bg-red-200 text-black font-bold rounded-t px-4 py-2">
      {props.title}
    </div>
    <div class="rounded-b bg-red-100 px-4 py-3 text-red-800">

      <p>{props.message}</p>
    </div>
  </div>
}
export default Alert;