import { Component } from '@angular/core';
import { UserIDService } from './services/user-id.service';
import { AlertService } from './services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private userIdService: UserIDService, private alertService: AlertService) {}

  ngOnInit() {
    this.userIdService.queryId().subscribe({
      next: (response) => {
        const userId = response as string;
        this.userIdService.updateUserId(userId);
      },
      error: (response) => {
        console.log(response);
        this.alertService.addAlert(
          'Can not connect to server. Please refresh or try again later',
          10000,
          true
        );
      },
    });
  }
}
