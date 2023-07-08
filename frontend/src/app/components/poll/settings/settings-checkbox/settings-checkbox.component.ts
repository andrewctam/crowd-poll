import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WsPollService } from 'src/app/services/ws-poll.service';
import { BooleanEmitPayload } from 'src/app/types/types';

@Component({
  selector: 'settings-checkbox',
  templateUrl: './settings-checkbox.component.html',
})
export class SettingsCheckboxComponent {
  @Input() name!: string;
  @Input() text!: string;
  @Input() indent!: boolean;
  @Input() defaultChecked!: boolean;

  @Output() toggleSetting = new EventEmitter<BooleanEmitPayload>();

  checked: boolean = false;
  ngOnInit() {
    this.checked = this.defaultChecked;
  }


  toggle() {
    this.checked = !this.checked;

    this.toggleSetting.emit({
      identifier: this.name,
      newValue: this.checked
    });
    
  }
}
