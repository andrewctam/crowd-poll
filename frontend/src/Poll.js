import react, {useState, useRef} from 'react'
import Option from "./Option"


function Poll(props) {
    const optionInput = useRef(null);

    const addOption = async (e) => {
      e.preventDefault();

      const url = "http://localhost:5001/api/polls/option"
      const optionTitle = optionInput.current.value

      if (optionTitle === "") {
        alert("Enter title")
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({optionTitle: optionTitle, id: props.id})
      })   
      
      optionInput.current.value = "";
    }


    //const sorted = props.options.sort(  (a, b) => { return b["votes"] - a["votes"]  } )
    
    const options = props.options.map(obj => <Option 
      key = {obj["_id"]}
      pollId = {props.id} 
      votes = {obj["votes"]} 
      optionTitle = {obj["optionTitle"]} 
      optionId = {obj["_id"]} 
      getPoll = {props.getPoll} />);



    return <div className = "h-screen ">
        <div className = "bg-slate-600 h-2/6">
          <div className = "text-3xl bold p-5 text-white">{props.title}</div>
          <form className = "py-10 " onSubmit={addOption}>
            <input ref = {optionInput} required = {true} className = "h-10 w-96 rounded text-black text-lg placeholder:text-black bg-slate-200 p-2 border border-black" placeholder="Enter an option..."/>
            <br />
            <button type="submit" className = "bg-black text-gray-200 border border-black p-2 m-2 rounded" >Add Option</button>

          </form>
          
        </div>

        <div className = "h-4/6 overflow-y-auto px-5 py-2 bg-slate-500"> 
        { options.length === 0 ? null : 
            <p className='text-xl bold text-white mb-2'>Click on an option to vote. Click again to remove your vote.</p>
        }
          {options}
        </div>


        

        </div>

    


}

export default Poll