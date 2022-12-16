interface CreatedBoxProps {
    id: string
    key: string
    title: string
    toggleSelected: (e: React.FormEvent<HTMLInputElement>) => void
    selected: boolean
    checked: boolean

}

const CreatedBox = (props: CreatedBoxProps) => {
    return <li className = "h-fit flex justify-between">
        <a className = {`${props.selected ? "text-red-200" : "text-blue-200"} truncate`} 
        href={`poll/?id=${props.id}`}>{props.title}</a>
        <input type="checkbox" id = {props.id} checked = {props.checked} onChange = {props.toggleSelected} className = "border border-black ml-2 self-center"></input>
    </li>
} 

export default CreatedBox;