interface SettingListDisplayProps {
    text: string
    display: boolean
    
}
const SettingListDisplay = (props: SettingListDisplayProps) => {
    if (props.display)
        return <li className="text-white text-md">{props.text}</li>
    else
        return null;
}

export default SettingListDisplay;

