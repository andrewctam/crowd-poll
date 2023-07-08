import { Component, Input } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
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

  url: string = window.location.href;
  userView: boolean = false;
  selectedSlice: string = "";

  ngOnInit() {
    this.userIdService.queryId().subscribe({
      next: (response) => {
        const userId = response as string;
        this.userIdService.saveId(userId);

        this.connectToPoll(userId);
      },
      error: (response) => {
        console.log(response);
        this.alertService.addAlert(
          'Can not connect to server. Please refresh or try again later',
          10000,
          'error'
        );
      },
    });
  }

  reconnect: ReturnType<typeof setInterval> | null = null;

  connectToPoll(userId: string) {
    this.wsPollService.connect(this.pollId, userId).subscribe({
      next: (msg) => {
        const data: WSMessage = msg;

        if (this.reconnect) {
          this.alertService.addAlert("Succesfully Reconnected!");
          clearInterval(this.reconnect)
          this.reconnect = null;
        }

        if (data.update) 
          this.pollData = data as PollData;
        else if (data.success) 
          this.alertService.addAlert(data.success, 2000);
        else if (data.error)
          this.alertService.addAlert(data.error, 2000, 'error');
      },
      error: (err) => { console.log("Connection error:", err) },
      complete: () => {
        this.reconnect = setInterval(() => {
          this.alertService.addAlert("Disconnected from server. Trying to reconnect...", 4000, "error");
          this.connectToPoll(userId);
        }, 5000);
      }
    });
  }

  constructor(
    private wsPollService: WsPollService,
    private userIdService: UserIDService,
    private alertService: AlertService
  ) {}

  selectInput(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  setSelectedSlice(optionId: string) {
    this.selectedSlice = optionId;
  }

  toggleUserView() {
    this.userView = !this.userView;

    this.userIdService.setUserView(this.userView).subscribe({
      next: () => {
        //refresh poll with what the users see
        this.wsPollService.updates?.next({
          type: "getPoll",
          pollId: this.pollData?.pollId,
          userId: this.userIdService.userId
        })
      },
      error: (err) => {console.log(err)}
    });
  }




}
