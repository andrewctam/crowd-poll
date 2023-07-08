import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterMethod, SortingMethod } from 'src/app/types/types';

@Component({
  selector: 'dropdown-option',
  templateUrl: './dropdown-option.component.html',
})
export class DropdownOptionComponent {
  @Input() disabled!: boolean;
  @Input() selected!: boolean;
  @Input() name!:  SortingMethod | FilterMethod;

  @Output() setSelectedMethod = new EventEmitter<string>();

  set() {
    this.setSelectedMethod.emit(this.name);
  }

}
