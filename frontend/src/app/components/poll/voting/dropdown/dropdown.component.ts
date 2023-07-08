import { Component, Input } from '@angular/core';
import { FilterMethod, SortingMethod } from 'src/app/types/types';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent {

  @Input() name!: string;
  @Input() selected!: SortingMethod | FilterMethod;

  show: boolean = false;

}
