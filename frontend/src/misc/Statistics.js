import { VictoryPie } from 'victory-pie'
import { VictoryLabel } from 'victory-core'

const Statistics = (props) => {
    let voteSum = 0
    const data = props.options.filter(option => option.votes > 0).map(option => {
        voteSum += option.votes
        if (option.optionTitle.length > 10) {
            return { 
                x: option.optionTitle.substring(0, 10) + "...", 
                y: option.votes 
            }
        }
        return {
            "x": option.optionTitle,
            "y": option.votes
        }
    });

    if (data.length === 0)
        return null;

    return (<div className="w-full h-fit mx-auto">
        <VictoryPie
            data={data}
            colorScale={["#80a4c4", "#97d6c9", "#7982d1", "#c1e0ad", "#c0d15e"]}
            style={{
                parent: {
                    width: "60%",
                    marginLeft: "auto",
                    marginRight: "auto"
                }, 
                labels: {
                    fill: "white",
                    fontFamily: "sans-serif",
                    overflow: "visible",

                },
            }}
            labels = {
                ({ datum }) => `${datum.x} (${Math.round(datum.y / voteSum * 100)}%)`
            }
            labelComponent={<VictoryLabel renderInPortal />}

            padAngle={2}
            innerRadius={50}
        />

    </div>)

}

export default Statistics