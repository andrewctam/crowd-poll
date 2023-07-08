import { Pipe, PipeTransform } from '@angular/core';
import { Option, SortingMethod } from '../types/types';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(value: Option[], sortingMethod: SortingMethod): Option[] {
    switch (sortingMethod) {
      case "Alphabetical Order":
        value.sort((a, b) => {
          return a["optionTitle"] > b["optionTitle"] ? 1 : -1;
        });
        break;
  
      case "Vote Count":
        value.sort((a, b) => {
          return b["votes"] - a["votes"];
        });
        break;
  
      case "Order Created": //already sorted in order created
      default:
        break;
    }

    return value;
  }

}
