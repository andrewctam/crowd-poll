import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { CreatedPoll, StoredPoll } from '../types/types';

@Injectable({
  providedIn: 'root'
})



export class PollService {
  constructor(private http: HttpClient) { }

  createPoll(title: string, userId: string): Observable<Object> {
    const url = `${environment.http_url}/api/polls/create`

    const headers = {
      'Content-Type': 'application/json'
    }

    const body = {
      title,
      userId
    }

    return this.http.post(url, body, { headers });
  }

  getCreatedPolls(): CreatedPoll[] {
    const storage = localStorage.getItem("createdPolls");
    if (storage == null)
      return [];
    else {
      const stored: StoredPoll[] = JSON.parse(storage);

      return stored.reverse().map((p) => {
        return {
          ...p,
          selected: false
        }
      });
    }
  }


  storeCreatedPoll(pollId: string, title: string): void {
    let polls: StoredPoll[] = [];

    const storage = localStorage.getItem("createdPolls");
    if (storage != null)
      polls = JSON.parse(storage);

    polls.push({
      pollId,
      title
    });

    localStorage.setItem("createdPolls", JSON.stringify(polls));
  }

  deletePolls(polls: StoredPoll[], userId: string): Observable<Object> | undefined {
    const toDelete = polls.map((p) => p.pollId).join(".");

    if (toDelete.length === 0) {
      return;
    }

    const storedCreated = this.getCreatedPolls();

    if (toDelete.length === storedCreated.length) {
      localStorage.removeItem("createdPolls")
    } else {
      
      //remove only polls that we deleted
      const trimmed: StoredPoll[] = storedCreated
        .filter((p) => {
            return !toDelete.includes(p.pollId);
          })
        .map((p) => {
            return {
              pollId: p.pollId,
              title: p.title
            }
        })
      
      localStorage.setItem("createdPolls", JSON.stringify(trimmed));
    }

    const url = `${environment.http_url}/api/polls/delete`;
    const headers = {
      'Content-Type': 'application/json'
    }

    const body = JSON.stringify({
      pollIds: toDelete,
      userId
    })

    return this.http.delete(url, { headers, body });
  }

}
