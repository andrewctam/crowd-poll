import { Component, Input } from '@angular/core';
import { EMPTY_POLL } from 'src/app/constants/constants';
import { PollDataService } from 'src/app/services/poll-data.service';
import { UserIDService } from 'src/app/services/user-id.service';
import { WsPollService } from 'src/app/services/ws-poll.service';
import { ToggleSettingEmit, PollData } from 'src/app/types/types';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  @Input() userView!: boolean;

  pollData: PollData = EMPTY_POLL;
  userId: string = '';
  anySettingActive: boolean = false;

  constructor(
    private userIdService: UserIDService,
    private pollDataService: PollDataService,
    private wsPollService: WsPollService
  ) {}

  ngOnInit() {
    this.pollDataService.pollData$.subscribe((pollData) => {
      if (pollData) {
        this.pollData = pollData;

        this.anySettingActive = (
          pollData.settings['disableVoting'] ||
          pollData.settings['hideVotes'] ||
          pollData.settings['limitOneVote'] ||
          pollData.settings['approvalRequired']);
        }
    });
    this.userIdService.userId$.subscribe((userId) => {
      this.userId = userId;
    });
  }

  setSetting(payload: ToggleSettingEmit) {
    this.wsPollService.updates?.next({
      type: 'updateSetting',
      pollId: this.pollData.pollId,
      userId: this.userId,
      setting: payload.setting,
      newValue: payload.newValue,
    });
  }
}
