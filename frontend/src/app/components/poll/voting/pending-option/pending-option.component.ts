import { Component, Input } from '@angular/core';
import { Option } from 'src/app/types/types';

@Component({
  selector: 'pending-option',
  templateUrl: './pending-option.component.html',
})
export class PendingOptionComponent {
  @Input() optionTitle!: string;
}
