import { Component } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { Alert } from '../../types/types';

@Component({
  selector: 'alerts',
  templateUrl: './alerts.component.html',
})
export class AlertsComponent {
  alerts: Alert[] = [];

  constructor(private alertsService: AlertService) {}

  ngOnInit() {
    this.alertsService.alerts$.subscribe((alerts) => {
      this.alerts = alerts;
    })
  }
}
