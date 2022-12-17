import {useState, useEffect} from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

interface SettingCheckBoxProps {
    active: boolean
    ws: W3CWebSocket
    pollId: string
    userId: string
    name: string
    indent: boolean
    text: string
}

const SettingCheckBox = (props: SettingCheckBoxProps) => {
    const [clientActive, setClientActive] = useState(props.active); //allows settings to be responsive even if there is server delay

    useEffect(() => {
        setClientActive(props.active);
    }, [props.active])

    const handleChange = async (e: React.FormEvent<HTMLInputElement>) => {        
        setClientActive(!clientActive);

        props.ws.send(JSON.stringify({
            type: "updateSetting",
            pollId: props.pollId,
            userId: props.userId,
            setting: props.name,
            newValue: (e.target as HTMLInputElement).checked
        }));


    }

    return (<div className = "text-white flex justify-between">
        <label className = {"px-1 mr-2 " + (props.indent ? "text-gray-300 ml-4" : "text-white")} htmlFor={props.name}>
            {props.text}
        </label>

        <input className = "border border-black ml-1 self-center" id={props.name} type="checkbox" onChange = {handleChange} checked = {clientActive} />
    </div>)
}

export default SettingCheckBox;