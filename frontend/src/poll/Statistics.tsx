import * as d3 from 'd3';
import {OptionData} from '../App';

interface StatisticsProps {
    options: OptionData[]
    setSelectedSlice: (str: string) => void
}

interface PieChartProps {
    data: OptionData[]
    voteSum: number
    setSelectedSlice: (str: string) => void
 }


const Statistics = (props: StatisticsProps) => {
    let voteSum = 0
    
    const data = props.options.filter(option => option.votes > 0 && option.approved).map(option => {
        voteSum += option.votes

        let title = option.optionTitle
        if (title.length > 10)
            title = title.substring(0, 10) + "...";

        return {
            "approved": true, //only approved allowed
            "optionTitle": title,
            "votes": option.votes,
            "_id": option._id
        }
    });

    if (data.length === 0)
        return null;

    return (<div className="w-full p-5 h-fit mx-auto">
            <svg className="w-1/2 h-full mx-auto" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(200,200)">
                    <PieChart data={data} voteSum = {voteSum} setSelectedSlice = {props.setSelectedSlice} />
                </g>
            </svg>
        </div>)
}




const PieChart = (props: PieChartProps) => {
    const colors = d3.scaleOrdinal(["#c2d9f2","#afcbe6","#7dbbf5","#76a7d6","#72cae0","#88d4d9"]);

    const radius = 200

    const pie = d3.pie<OptionData>().value((d: any) => d.votes)

    const arc = d3.arc<d3.PieArcDatum<OptionData>>()
        .innerRadius(80)
        .outerRadius(radius)

        
    const arcs = pie(props.data)

    //labels
    const labelArc = d3.arc<d3.PieArcDatum<OptionData>>()
        .outerRadius(radius - 60)
        .innerRadius(radius - 60);


    //center text
    const centerText = d3.arc<d3.PieArcDatum<OptionData>>()
        .innerRadius(0)
        .outerRadius(0);



    return (
        <g>
            {arcs.map((d, i) => (
                <g key={i} onMouseEnter = {() => {props.setSelectedSlice(d.data["_id"])}} onMouseLeave = {() => {props.setSelectedSlice("")}} className = "cursor-crosshair">
                    <path d={arc(d) ?? ""} fill={i === arcs.length - 1 && colors(i + '') === colors("0") ? colors((i + 1) + '') : colors(i + '')} />
                    <text transform={`translate(${labelArc.centroid(d)})`} textAnchor="middle" fill="black" fontSize="14px">{`${d.data.optionTitle} (${Math.round((d.data.votes / props.voteSum) * 100)}%)`}</text>
                </g>
            ))}

            <text transform={`translate(${centerText.centroid(arcs[0])})`} textAnchor="middle" fill="white" fontSize="20px">{`${props.voteSum} ${props.voteSum === 1 ? "vote" : "votes"}`}</text>
        </g>
    )

}



export default Statistics