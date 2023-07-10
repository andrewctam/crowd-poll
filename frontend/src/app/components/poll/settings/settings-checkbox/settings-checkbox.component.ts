import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { PollDataService } from 'src/app/services/poll-data.service';
import { PollErrorService } from 'src/app/services/poll-error.service';
import { UserIDService } from 'src/app/services/user-id.service';
import { WsPollService } from 'src/app/services/ws-poll.service';
import { PollData, PollSettings, ToggleSettingEmit } from 'src/app/types/types';

@Component({
  selector: 'settings-checkbox',
  templateUrl: './settings-checkbox.component.html',
})
export class SettingsCheckboxComponent {
  @Input() name!: string;
  @Input() text!: string;
  @Input() indent?: boolean;

  userId: string = "";
  checked: boolean = false;
  pollId: string = "";

  updating: boolean = false;

  constructor(
    private userIdService: UserIDService,
    private wsPollService: WsPollService,
    private pollDataService: PollDataService,
    private pollErrorService: PollErrorService) {}

  ngOnInit() {
    this.userIdService.userId$.subscribe((userId) => {
      this.userId = userId;
    })

    this.pollDataService.pollData$.subscribe((pollData) => {
      if (pollData) {
        this.pollId = pollData.pollId;

        const newChecked = pollData.settings[this.name as keyof PollSettings];
        if (newChecked !== this.checked) {
          this.updating = false;
        }

        this.checked = newChecked;
      }

    })

    this.pollErrorService.pollError$.subscribe((error) => {
      if (error !== "") {
        this.updating = false;
      }
    })
  }

  toggleChecked() {
    if (this.updating) {
      return;
    }
      
    this.updating = true;

    this.wsPollService.updates?.next({
      type: 'updateSetting',
      pollId: this.pollId,
      userId: this.userId,
      setting: this.name,
      newValue: !this.checked,
    });
  }
  
}
