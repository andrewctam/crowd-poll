import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserIDService {
  constructor(private http: HttpClient) { }

  private userIdSubject = new BehaviorSubject<string>("");

  private userId: string = "";
  userId$ = this.userIdSubject.asObservable();

  queryId(): Observable<Object> {
    const storedUserId = localStorage.getItem("userId");

    //can't have an empty string or it fetches an invalid API "api/users/" isntead of "api/users/:id"
    const searchId = storedUserId ? storedUserId : "null"

    //verify that the user id is in the database or get a new one
    const url = `${environment.http_url}/api/users/${searchId}`
    return this.http.get(url);
  }

  updateUserId(id: string): void {    
    //user id found in db, no change
    if (id === localStorage.getItem("userId"))  {
      console.log("R " + id);

    //new user id created, either none provided or invalid one provided
    } else { 
      console.log("N " + id);
      localStorage.setItem("userId", id);
      localStorage.removeItem("createdPolls"); //remove created polls since userId changed
    }

    this.userIdSubject.next(id);
    this.userId = id;
  }


  setUserView(newValue: boolean): Observable<Object> {
    const url = `${environment.http_url}/api/users/userView`;
    const headers = {
      'Content-Type': 'application/json'
    }
    const body = { 
      userId: this.userId,
      newValue 
    };

    return this.http.put(url, body, { headers });
  }

  setError() {
    this.userIdSubject.next("ERROR");
  }
}
