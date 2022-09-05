
const CreatedBox = (props) => {
    return <li className = "h-fit flex justify-between">
        <a className = "text-blue-200 truncate" href={`?poll=${props.id}`}>{props.title}</a>
        <input id = {props.id} checked = {props.checked} onChange = {props.toggleSelected} className = "border border-black ml-2 self-center" type="checkbox"></input>
    </li>
} 

export default CreatedBox;