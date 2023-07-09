import { Component, Input } from '@angular/core';
import { CreatedPoll } from '../../../types/types';
import { HttpPollService } from '../../../services/http-poll.service';
import { AlertService } from '../../../services/alert.service';
import { CreatedPollsService } from 'src/app/services/created-polls.service';
import { UserIDService } from 'src/app/services/user-id.service';

@Component({
  selector: 'created-polls',
  templateUrl: './created-polls.component.html',
})
export class CreatedPollsComponent {
  userId!: string;
  createdPolls: CreatedPoll[] = [];
  pollsSelected: number = 0;
  isAllSelected: boolean = false;

  constructor(
    private userIdService: UserIDService,
    private httpPollService: HttpPollService,
    private alertService: AlertService,
    private createdPollService: CreatedPollsService
  ) { }

  ngOnInit() {
    this.userIdService.userId$.subscribe((userId) => { 
      this.userId = userId 
    });

    this.createdPollService.getCreatedPolls();
    
    this.createdPollService.createdPolls$.subscribe((cp) => {
      this.createdPolls = cp;
      this.pollsSelected = cp.filter((p) => p.selected).length;
      this.isAllSelected = this.pollsSelected === cp.length;
    })
  }

  toggleSelected(pollId: string) {
    this.createdPollService.toggleSelected(pollId);
  }

  setAll() {
    //if all selected, set all to false. otherwise true
    this.createdPollService.setAll(!this.isAllSelected);
  }

  deletePolls() {
    const selected = this.createdPolls.filter((p) => p.selected);

    this.httpPollService.deletePolls(selected, this.userId)?.subscribe({
      next: (response) => {
        this.alertService.addAlert('Polls deleted');
        this.createdPolls = this.createdPollService.getCreatedPolls();
      },
      error: (response) => {
        console.log(response);
      },
    });
  }

  trackCreatedPolls(index: number, poll: CreatedPoll) {
    return poll.pollId;
  }
}
