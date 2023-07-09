import { Component, Input } from '@angular/core';
import { CreatedPoll } from '../../../types/types';
import { HttpPollService } from '../../../services/http-poll.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'created-polls',
  templateUrl: './created-polls.component.html',
})
export class CreatedPollsComponent {
  @Input() userId!: string;

  createdPolls: CreatedPoll[];

  constructor(private httpPollService: HttpPollService, private alertService: AlertService) {
    this.createdPolls = this.httpPollService.getCreatedPolls()
  }

  get pollsSelected(): number {
    return this.createdPolls.filter((p) => p.selected).length;
  }

  get isAllSelected(): boolean {
    //can find a selected poll?
    return this.pollsSelected === this.createdPolls.length;
  }

  setAll() {
    //if all selected, set all to false. otherwise, set all to true.
    const endRes = !this.isAllSelected;

    this.createdPolls.forEach((p) => {p.selected = endRes})
  }

  deletePolls() {
    const selected = this.createdPolls.filter((p) => p.selected);

    this.httpPollService.deletePolls(selected, this.userId)?.subscribe({
      next: (response) => {
        this.alertService.addAlert("Polls deleted")
        this.createdPolls = this.httpPollService.getCreatedPolls()
      },
      error: (response) => {console.log(response)},
    });
  }
  
}
