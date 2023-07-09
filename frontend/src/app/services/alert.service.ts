import { Injectable } from '@angular/core';
import { Alert } from '../types/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  alerts$ = this.alertsSubject.asObservable();

  alerts: Alert[] = [];
  total: number = 0;

  addAlert(msg: string, time: number = 2000, error: boolean = false) {
    const alert = {
      msg,
      id: this.total,
      error
    };
    
    
    this.alerts.push(alert);

    setTimeout(() => {
      const index = this.alerts.findIndex((a) => a.id === this.total);
      if (index != undefined)
        this.alerts.splice(index, 1);
    }, time)

    this.total++;
    this.alertsSubject.next(this.alerts);
  }

}
