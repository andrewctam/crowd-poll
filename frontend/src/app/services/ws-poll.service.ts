import { Injectable } from '@angular/core';
import { Observable, Observer, map } from 'rxjs';
import { AnonymousSubject, Subject } from 'rxjs/internal/Subject';
import { environment } from 'src/environments/environment.development';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})

export class WsPollService {
  private subject: AnonymousSubject<MessageEvent> | null = null;
  updates: Subject<Object> | null = null;
  ping: ReturnType<typeof setInterval> | null = null;
  
  constructor(private alertService: AlertService) {}

  public connect(pollId: string, userId: string): Subject<Object> {
    if (this.updates) {
      return this.updates;
    } else {
      return this.initConnection(pollId, userId);
    }
  }

  private initConnection(pollId: string, userId: string): Subject<Object> {
    const url = `${environment.ws_url}?poll=${pollId}&user=${userId}`

    const ws = new WebSocket(url);

    const observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);

      return ws.close.bind(ws);
    });

    this.subject = new AnonymousSubject<MessageEvent>({
      next: (data: Object) => {
        console.log('Sent to server: ', data);
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      },
      error: (err) => {console.log(err)},
      complete: () => {}
    }, observable);

    this.updates = <Subject<Object>>this.subject.pipe(
      map((response: MessageEvent): Object => {
        console.log(response.data);
        return JSON.parse(response.data);
    }));

    this.ping = setInterval(() => {
      if (ws.readyState === ws.CLOSED) {
				
        if (this.ping) 
          clearInterval(this.ping);
          this.updates?.complete();
          this.subject?.complete();
          ws.close();

          this.ping = null;
          this.subject = null;
          this.updates = null;
			} else {
        this.updates?.next({ "type": "ping" })
      }
    }, 5000)
    
    return this.updates;
  }


}
