import {useEffect, useRef} from "react";

const Dropdown = (props) => {
    const handleClick = (e) => {
        props.setShow(!props.show);
    }

    const ref = useRef(null)
    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                props.setShow(false);
            
        }

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
        // eslint-disable-next-line
    }, [ref]);
      

    return (
        <div ref = {ref} onClick = {handleClick} className = "relative lg:inline-block w-fit rounded-lg bg-slate-300/20 px-2 py-1 mx-auto my-1 lg:my-0 lg:mx-2 shadow-md">
            <div className = "inline-block text-white font-semibold text-wrap-">{props.name} </div>
            <div className = "inline-block text-sky-300 mx-1 font-semibold text-wrap-">{props.selected} </div>
            <div className = "inline-block text-white text-wrap-">{props.show ? String.fromCharCode(9650) /*up arrow*/ : String.fromCharCode(9660) /*down arrow*/} </div>
            
             
            {props.show ? 
            <div className = "absolute bg-stone-600 w-48 border border-stone-700 left-[-1px] rounded-tr-lg rounded-b-lg z-10 p-2 shadow-md">
                {props.children}
            </div> : null }
        </div>
    )
}


export default Dropdown