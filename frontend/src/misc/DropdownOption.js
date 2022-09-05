
const DropdownOption = (props) => {
    const setSorting = (e) => {
        e.stopPropagation();
        props.setSortingMethod(props.name);
    }

    if (props.disabled)
        return (<div 
                className = {"block text-center w-full text-gray-400"}>
                {props.name}
            </div>)

    return (<div 
        onClick = {setSorting} 
        className = {"cursor-pointer block w-full text-center " + (props.selected ? "text-sky-400" : "text-white")}>
        {props.name}
        
    </div>)

}

export default DropdownOption;