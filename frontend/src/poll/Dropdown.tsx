import React, {useEffect, useRef} from "react";

interface DropdownProps {
    name: string
    method: string
    show: boolean
    setShow: (show: boolean) => void
    children: (JSX.Element | null)[]
}

const Dropdown = (props: DropdownProps) => {
    const handleClick = () => {
        props.setShow(!props.show);
    }

    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !(ref.current as HTMLDivElement).contains(e.target as Node))
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
            <div className = "inline-block text-sky-300 mx-1 font-semibold text-wrap-">{props.method} </div>
            <div className = "inline-block text-white text-wrap-">{props.show ? String.fromCharCode(9650) /*up arrow*/ : String.fromCharCode(9660) /*down arrow*/} </div>
            
             
            {props.show ? 
            <div className = "absolute bg-stone-600 w-48 border border-stone-700 left-[-1px] rounded-tr-lg rounded-b-lg z-20 p-2 shadow-md">
                {props.children}
            </div> : null }
        </div>
    )
}


export default Dropdown