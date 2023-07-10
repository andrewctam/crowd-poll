import { Pipe, PipeTransform } from '@angular/core';
import { FilterMethod, Option } from '../types/types';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: Option[], filterMethod: FilterMethod, votedFor: string[]): Option[] {
    let filtered: Option[] = value;

    switch (filterMethod) {
      case "Voted For":
        filtered = value.filter((option) => {
          return votedFor.includes(option["_id"]);
        });
        break;
      case "Not Voted For":
        filtered = value.filter((option) => {
          return !votedFor.includes(option["_id"]) && option["approved"]; //not approved can't be voted for
        });
        break;
      case "Approved":
        filtered = value.filter((option) => {
          return option["approved"];
        });
        break;
      case "Pending Approval":
        filtered = value.filter((option) => {
          return !option["approved"];
        });
        break;
  
      case "All":
      default:
        break;
    }


    return filtered;
  }

}
