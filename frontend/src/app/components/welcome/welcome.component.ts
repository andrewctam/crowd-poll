import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { HttpPollService } from 'src/app/services/http-poll.service';
import { UserIDService } from 'src/app/services/user-id.service';

@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  constructor(
    private userIdService: UserIDService,
    private httpPollService: HttpPollService,
    private alertService: AlertService,
    private router: Router
  ) {}

  titleInput: string = '';
  userId: string = '';

  ngOnInit() {
    this.userIdService.userId$.subscribe((userId) => {
      this.userId = userId;
   });
  }

  createPoll() {
    this.httpPollService.createPoll(this.titleInput, this.userId).subscribe({
      next: (response) => {
        type Payload = { pollId: string };
        const pollId = (response as Payload).pollId;

        this.httpPollService.storeCreatedPoll(pollId, this.titleInput);
        this.router.navigate(['poll', pollId]);
      },
      error: (response) => {
        console.log(response)
        this.alertService.addAlert(
          'Error creating poll, please try again',
          2000,
          true
        );
      },
    });
  }
}
