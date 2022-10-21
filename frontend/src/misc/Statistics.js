import * as d3 from 'd3';

const Statistics = (props) => {
    let voteSum = 0
    const data = props.options.filter(option => option.votes > 0).map(option => {
        voteSum += option.votes
        if (option.optionTitle.length > 10) {
            return { 
                "title": option.optionTitle.substring(0, 10) + "...", 
                "votes": option.votes 
            }
        }

        return {
            "title": option.optionTitle,
            "votes": option.votes
        }
    });

    if (data.length === 0)
        return null;

    return (<div className="w-full p-5 h-fit mx-auto">
            <svg className="w-3/5 h-fit mx-auto" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(200,200)">
                    <PieChart data={data} voteSum = {voteSum} />
                </g>
            </svg>
        </div>)
}

const PieChart = (props) => {
    const data = props.data;
    
    var color = d3.scaleOrdinal(["#f7fbff","#e1edf8","#cadef0","#abcfe6","#82badb"]);

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
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);


    //center text
    const centerText = d3.arc()
        .innerRadius(0)
        .outerRadius(0);


    return (
        <g>
            {arcs.map((d, i) => (
                <g key={i}>
                    <path d={arc(d)} fill={color(i)} />
                    <text transform={`translate(${labelArc.centroid(d)})`} textAnchor="middle" fill="black" fontSize="12px">{`${d.data.title} (${Math.round((d.data.votes / props.voteSum) * 100)}%)`}</text>
                </g>
            ))}

            <text transform={`translate(${centerText.centroid(arcs[0])})`} textAnchor="middle" fill="white" fontSize="20px">{`${props.voteSum} votes`}</text>
        </g>
    )

}



export default Statistics