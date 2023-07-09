import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreatedPoll, StoredPoll } from '../types/types';
import { CreatedPollsService } from './created-polls.service';

@Injectable({
  providedIn: 'root'
})
export class HttpPollService {
  constructor(private http: HttpClient, private createdPollService: CreatedPollsService) { }

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

  deletePolls(polls: StoredPoll[], userId: string): Observable<Object> | undefined {
    const toDelete = polls.map((p) => p.pollId).join(".");

    if (toDelete.length === 0) {
      return;
    }

    const storedCreated = this.createdPollService.getCreatedPolls();

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
