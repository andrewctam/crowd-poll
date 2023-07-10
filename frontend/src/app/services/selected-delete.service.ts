import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PollDataService } from './poll-data.service';
import { Option } from '../types/types';

@Injectable({
  providedIn: 'root'
})
export class SelectedDeleteService {
  private selectedDeleteService = new BehaviorSubject<string[]>([]);
  selectedDelete$ = this.selectedDeleteService.asObservable();
  private selectedDelete: string[] = [];

  private options: Option[] = [];

  constructor(private pollDataService: PollDataService) {
    this.pollDataService.pollData$.subscribe((pollData) => {
      if (pollData) {
        this.options = pollData.options;
      }
    });
  }

  toggleSelected(optionId: string) {
    const i = this.selectedDelete.findIndex((id) => id === optionId);

    if (i >= 0) {
      this.selectedDelete.splice(i, 1);
    } else {
      this.selectedDelete.push(optionId);
    }

    this.selectedDeleteService.next(this.selectedDelete);
  }

  selectAll() {
    if (this.selectedDelete.length === this.options.length) {
      this.clear();
    } else {
      this.selectedDelete = this.options
        .filter((o) => o.approved)
        .map((o) => o._id);

      this.selectedDeleteService.next(this.selectedDelete);
    }

  }

  clear() {
    this.selectedDelete = [];
    this.selectedDeleteService.next(this.selectedDelete);
  }


}
