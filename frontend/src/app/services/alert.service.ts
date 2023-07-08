import { Injectable } from '@angular/core';
import { Alert } from '../types/types';

@Injectable({
  providedIn: 'root'
})


export class AlertService {
  constructor() { }

  alerts: Alert[] = [];
  total: number = 0;

  addAlert(msg: string, time: number = 2000, type: string = "success") {
    const alert = {
      msg,
      id: this.total,
      type
    };
    
    
    this.alerts.push(alert);

    setTimeout(() => {
      const index = this.alerts.findIndex((a) => a.id === this.total);
      if (index != undefined )
        this.alerts.splice(index, 1);
    }, time)

    this.total++;
  }


  getAlerts(): Alert[] {
    return this.alerts;
  }
}
