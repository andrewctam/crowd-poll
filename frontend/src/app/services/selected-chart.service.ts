import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedChartService {
  private selectedChartSubject = new BehaviorSubject<string>("");
  selectedChart$ = this.selectedChartSubject.asObservable();

  setSelected(optionId: string) {
    this.selectedChartSubject.next(optionId);
  }
}
