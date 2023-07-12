import { Component } from '@angular/core';
import { UserIDService } from './services/user-id.service';
import { AlertService } from './services/alert.service';
import { delay, retry } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private userIdService: UserIDService, private alertService: AlertService) {}

  ngOnInit() {
    this.userIdService.queryId().pipe(
      retry(3),
      delay(2000)
    ).subscribe({
      next: (response) => {
        const userId = response as string;
        this.userIdService.updateUserId(userId);
      },
      error: (response) => {
        console.log(response);
        this.alertService.addAlert(
          'Can not connect to server. Please refresh and try again later',
          5000,
          true
        );

        this.userIdService.setError();
      },
    });
  }
}
