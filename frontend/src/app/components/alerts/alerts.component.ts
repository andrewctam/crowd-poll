import { Component } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { Alert } from '../../types/types';

@Component({
  selector: 'alerts',
  templateUrl: './alerts.component.html',
})
export class AlertsComponent {
  constructor(private alertsService: AlertService) {}

  alerts: Alert[] = this.alertsService.getAlerts();

}
