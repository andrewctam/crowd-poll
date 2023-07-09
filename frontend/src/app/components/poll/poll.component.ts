import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { PollDataService } from 'src/app/services/poll-data.service';
import { UserIDService } from 'src/app/services/user-id.service';
import { WsPollService } from 'src/app/services/ws-poll.service';
import { PollData, WSMessage } from 'src/app/types/types';

@Component({
  selector: 'poll',
  templateUrl: './poll.component.html',
})
export class PollComponent {
  //from router
  @Input() pollId!: string;

  pollData: PollData | null = null;
  userId: string = '';

  reconnect: ReturnType<typeof setInterval> | null = null;
  userView: boolean = false;

  url: string = window.location.href;
  showError: boolean = false;

  constructor(
    private wsPollService: WsPollService,
    private userIdService: UserIDService,
    private alertService: AlertService,
    private pollDataService: PollDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userIdService.userId$.subscribe((userId) => {
      this.userId = userId;
      if (this.userId !== "")
        this.connectToPoll();
        
    });

    this.pollDataService.pollData$.subscribe(
      (pollData) => (this.pollData = pollData)
    );
  }

  connectToPoll() {
    this.wsPollService.connect(this.pollId, this.userId).subscribe({
      next: (msg) => {
        const data: WSMessage = msg;

        if (this.reconnect) {
          this.alertService.addAlert('Succesfully Reconnected!');
          clearInterval(this.reconnect);
          this.reconnect = null;
        }

        this.showError = false;
        if (data.update) {
          this.pollDataService.updatePollData(data as PollData);
        } else if (data.success) { 
          this.alertService.addAlert(data.success, 2000);
        } else if (data.error) {
          this.showError = true;

          if (data.error === "Poll Deleted") {
            this.alertService.addAlert("Poll Has Been Deleted", 2000, true);
            this.router.navigate([""]);
          } else {
            this.alertService.addAlert(data.error, 2000, true);
          }
        } 
      },
      error: (err) => {
        this.showError = true;
        console.log('Connection error:', err);
      },
      complete: () => {
        this.reconnect = setInterval(() => {
          this.alertService.addAlert(
            'Disconnected from server. Trying to reconnect...',
            4000,
            true
          );
          this.connectToPoll();
        }, 5000);
      },
    });
  }

  selectInput(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  toggleUserView() {
    this.userView = !this.userView;

    this.userIdService.setUserView(this.userView).subscribe({
      next: () => {
        //refresh poll with what the users see
        this.wsPollService.updates?.next({
          type: 'getPoll',
          pollId: this.pollData?.pollId,
          userId: this.userId,
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
