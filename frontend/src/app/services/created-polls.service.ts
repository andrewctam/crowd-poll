import { Injectable } from '@angular/core';
import { CreatedPoll, StoredPoll } from '../types/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreatedPollsService {
  private createdPollsSubject = new BehaviorSubject<CreatedPoll[]>([]);
  createdPolls$ = this.createdPollsSubject.asObservable();

  createdPolls: CreatedPoll[] = [];

  toggleSelected(pollId: string) {
    const poll = this.createdPolls.find((p) => p.pollId === pollId);

    if (poll) {
      poll.selected = !poll.selected;
      this.createdPollsSubject.next(this.createdPolls);
    }
  }
  
  setAll(selected: boolean) {    
    this.createdPolls.forEach((p) => {
      p.selected = selected;
    });

    this.createdPollsSubject.next(this.createdPolls);
  }

  getCreatedPolls(): CreatedPoll[] {
    const storage = localStorage.getItem('createdPolls');
    if (storage == null) { 
      return [];
    } else {
      const stored: StoredPoll[] = JSON.parse(storage);

      this.createdPolls = stored.reverse().map((p) => {
        return {
          ...p,
          selected: false,
        };
      });

      this.createdPollsSubject.next(this.createdPolls);
      return this.createdPolls;
    }
  }

  storeCreatedPoll(pollId: string, title: string): void {
    const poll: StoredPoll = { pollId, title };

    this.createdPolls.push({
      ...poll,
      selected: false,
    });

    this.createdPollsSubject.next(this.createdPolls);

    //store in local storage
    let polls: StoredPoll[] = [];
    const storage = localStorage.getItem('createdPolls');
    if (storage != null) polls = JSON.parse(storage);

    polls.push(poll);

    localStorage.setItem('createdPolls', JSON.stringify(polls));
  }
}
