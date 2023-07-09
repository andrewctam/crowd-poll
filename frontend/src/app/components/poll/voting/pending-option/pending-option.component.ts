import { Component, Input } from '@angular/core';

@Component({
  selector: 'pending-option',
  templateUrl: './pending-option.component.html',
})
export class PendingOptionComponent {
  @Input() optionTitle!: string;
}
