
const DropdownOption = (props) => {
    const setSorting = (e) => {
        e.stopPropagation();
        props.setSortingMethod(props.name);
    }

    if (props.disabled)
        return (
            <div className={"block text-center w-full text-gray-400"}>
                {props.name}
            </div>)
    else
        return (
            <div onClick={setSorting} className={"cursor-pointer block w-full text-center " + (props.selected ? "text-sky-300" : "text-white")}>
                {props.name}
            </div>)

}

export default DropdownOption;