import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PollErrorService {
  private pollErrorSubject = new BehaviorSubject<string>("");
  pollError$ = this.pollErrorSubject.asObservable();

  setError(error: string) {
    this.pollErrorSubject.next(error);
  }
}
