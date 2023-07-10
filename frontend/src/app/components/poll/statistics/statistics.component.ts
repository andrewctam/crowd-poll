import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { PieArcDatum, Option } from 'src/app/types/types';
import * as d3 from 'd3';
import { PollDataService } from 'src/app/services/poll-data.service';
import { SelectedChartService } from 'src/app/services/selected-chart.service';
import { CHART_RADIUS } from 'src/app/constants/constants';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.component.html',
})
export class StatisticsComponent {
  constructor(
    private pollDataService: PollDataService,
    private selectedChartService: SelectedChartService
  ) {}

  ngOnInit() {
    this.pollDataService.pollData$.subscribe((pollData) => {
      if (pollData) {
        this.constructPie(pollData.options);
      }
    })
  }

  setSelected(optionId: string) {
    this.selectedChartService.setSelected(optionId);
  }

  voteSum: number = 0;
  data: Option[] = [];
  arcs: PieArcDatum[] = [];
  arc = d3
    .arc<PieArcDatum>()
    .innerRadius(80)
    .outerRadius(CHART_RADIUS);
  colors = d3.scaleOrdinal([
      '#c2d9f2',
      '#afcbe6',
      '#7dbbf5',
      '#76a7d6',
      '#72cae0',
      '#88d4d9',
    ]);

  constructPie(options: Option[]) {
    this.voteSum = 0;

    //filter data, truncate titles, count votes
    this.data = options
      .filter((option) => option.votes > 0 && option.approved)
      .map((option) => {
        this.voteSum += option.votes;

        let title = option.optionTitle;
        if (title.length > 10) title = title.substring(0, 10) + '...';

        return {
          approved: true, //only approved allowed
          optionTitle: title,
          votes: option.votes,
          _id: option._id,
        };
      });


    const pie = d3.pie<Option>().value((d: any) => d.votes);
    this.arcs = pie(this.data);
  }

  label(title: string, votes: number) {
    return `${title} ${Math.round((votes / this.voteSum) * 100)}%`;
  }

  getColor(i: number) {
    if (i === this.arcs.length - 1 && this.colors(i + '') === this.colors('0')) {
      return this.colors((i + 1) + '');
    } else { 
      return this.colors(i + '');
    }
  }

  arcLabelTranslate(d: PieArcDatum) {
    const amount = d3
      .arc<PieArcDatum>()
      .outerRadius(CHART_RADIUS - 60)
      .innerRadius(CHART_RADIUS - 60)
      .centroid(d);

    return `translate(${amount})`;
  }

  middlePieTranslate(d: PieArcDatum) {
    const amount = d3
      .arc<PieArcDatum>()
      .innerRadius(0)
      .outerRadius(0)
      .centroid(d);

    amount[1] += 8

    return `translate(${amount})`
  }

}
