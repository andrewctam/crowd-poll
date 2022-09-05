import {useState, useEffect} from 'react';

const SettingCheckBox = (props) => {
    const [clientActive, setClientActive] = useState(props.active);

    useEffect(() => {
        setClientActive(props.active);
    }, [props.active])

    const handleChange = async (e) => {
        const url = "https://crowdpoll.fly.dev/api/polls/setting"
        setClientActive(!clientActive);

        await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pollId: props.pollId,
                userId: props.userId,
                setting: props.name,
                newValue: e.target.checked
            })
        })

    }

    return (<div className = "text-white flex justify-between">
        <label className = {"px-1 mr-2 " + (props.indent ? "text-gray-300 ml-4" : "text-white")} htmlFor={props.name}>
            {props.text}
        </label>

        <input className = "border border-black ml-1 self-center" id={props.name} type="checkbox" onChange = {handleChange} checked = {clientActive}></input>
    </div>)
}

export default SettingCheckBox;