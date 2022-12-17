import {useState} from 'react';

interface TitleBoxProps {
    title: string
}

function TitleBox(props: TitleBoxProps) {
    const [expanded, setExpandeed] = useState(false)

    return (
        <div 
            onClick = {() => {setExpandeed(!expanded)}}
            className="items-center m-5 p-3 rounded-xl bg-stone-600/75  text-3xl bold text-white shadow-lg sticky top-5 z-10 overflow-hidden text-ellipsis"
            style = {{ "overflowWrap": expanded ? "break-word" : "normal" }}
        >
            {props.title}
        </div>)
}

export default TitleBox