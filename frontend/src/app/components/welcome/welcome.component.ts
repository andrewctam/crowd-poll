import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { PollService } from 'src/app/services/poll.service';
import { UserIDService } from 'src/app/services/user-id.service';

@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  constructor(
    private userIdService: UserIDService, 
    private pollService: PollService, 
    private alertService: AlertService,
    private router: Router) { }

  titleInput: string = "";
  userId: string = "";

  ngOnInit() {
    this.userIdService.queryId().subscribe({
      next: (response) => { 
        this.userId = response as string,
        this.userIdService.saveId(this.userId)
      },
      error: (response) => {
        console.log(response)
        this.alertService.addAlert("Can not connect to server. Please refresh or try again later", 10000, "error");
        this.userId = "";
      }
    });
  }

  createPoll() {
    this.pollService.createPoll(this.titleInput, this.userId).subscribe({
      next: (response) => {
        type Payload = { pollId: string }
        const pollId = (response as Payload).pollId;
        console.log(response)

        this.pollService.storeCreatedPoll(pollId, this.titleInput);
        this.router.navigate(["poll", pollId])
       },
      error: (response) => {
        console.log(response)
        this.alertService.addAlert("Error creating poll, please try again", 2000, "error")
      }
    });

  }


}
