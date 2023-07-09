import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PollData } from '../types/types';

@Injectable({
  providedIn: 'root'
})
export class PollDataService {
  private pollDataSubject = new BehaviorSubject<PollData | null>(null);

  pollData$ = this.pollDataSubject.asObservable();
    
  updatePollData(pollData: PollData) {
    this.pollDataSubject.next(pollData);
  }

}
