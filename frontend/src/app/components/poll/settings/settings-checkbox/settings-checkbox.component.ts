import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { BooleanEmitPayload } from 'src/app/types/types';

@Component({
  selector: 'settings-checkbox',
  templateUrl: './settings-checkbox.component.html',
})
export class SettingsCheckboxComponent {
  @Input() name!: string;
  @Input() text!: string;
  @Input() indent!: boolean;
  @Input() checked!: boolean;

  @Output() toggleSetting = new EventEmitter<BooleanEmitPayload>();

  updating: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    this.updating = false;
  }

  toggle() {
    if (this.updating) {
      return;
    }
      
    this.updating = true;

    this.toggleSetting.emit({
      identifier: this.name,
      newValue: !this.checked
    });
    
  }
}
