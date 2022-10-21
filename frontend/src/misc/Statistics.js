import * as d3 from 'd3';

const Statistics = (props) => {
    let voteSum = 0
    const data = props.options.filter(option => option.votes > 0).map(option => {
        voteSum += option.votes
        if (option.optionTitle.length > 10) {
            return { 
                "title": option.optionTitle.substring(0, 10) + "...", 
                "votes": option.votes,
                "_id": option._id
            }
        }

        return {
            "title": option.optionTitle,
            "votes": option.votes,
            "_id": option._id
        }
    });

    if (data.length === 0)
        return null;

    return (<div className="w-full p-5 h-fit mx-auto">
            <svg className="w-3/5 h-fit mx-auto" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(200,200)">
                    <PieChart data={data} voteSum = {voteSum} setPieSelected = {props.setPieSelected} />
                </g>
            </svg>
        </div>)
}

const PieChart = (props) => {
    const data = props.data;
    
    const colors = d3.scaleOrdinal(["#c2d9f2","#abcbeb","#98b9ed","#afcbe6","#7dbbf5","#76a7d6","#72cae0","#88d4d9"]);

    const radius = 200

    const pie = d3.pie()
        .sort(null)
        .value(d => d.votes)
    const arc = d3.arc()
        .innerRadius(80)
        .outerRadius(radius)

        
    const arcs = pie(data)

    //labels
    const labelArc = d3.arc()
        .outerRadius(radius - 60)
        .innerRadius(radius - 60);


    //center text
    const centerText = d3.arc()
        .innerRadius(0)
        .outerRadius(0);



    return (
        <g>
            {arcs.map((d, i) => (
                <g key={i} onMouseEnter = {() => {props.setPieSelected(d.data["_id"])}} onMouseLeave = {() => {props.setPieSelected(null)}}>
                    <path d={arc(d)} fill={i === arcs.length - 1 && colors(i) === colors(0) ? colors(i + 1) : colors(i)} />
                    <text transform={`translate(${labelArc.centroid(d)})`} textAnchor="middle" fill="black" fontSize="12px">{`${d.data.title} (${Math.round((d.data.votes / props.voteSum) * 100)}%)`}</text>
                </g>
            ))}

            <text transform={`translate(${centerText.centroid(arcs[0])})`} textAnchor="middle" fill="white" fontSize="20px">{`${props.voteSum} ${props.voteSum === 1 ? "vote" : "votes"}`}</text>
        </g>
    )

}



export default Statistics