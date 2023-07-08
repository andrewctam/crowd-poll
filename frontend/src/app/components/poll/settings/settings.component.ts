import { Component, Input, SimpleChanges } from '@angular/core';
import { UserIDService } from 'src/app/services/user-id.service';
import { WsPollService } from 'src/app/services/ws-poll.service';
import { PollSettings, BooleanEmitPayload } from 'src/app/types/types';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  @Input() isOwner!: boolean;
  @Input() pollId!: string;
  @Input() settings!: PollSettings;

  anySettingActive: boolean = false;

  constructor(
    private userIdService: UserIDService,
    private wsPollService: WsPollService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.anySettingActive =
      this.settings['disableVoting'] ||
      this.settings['hideVotes'] ||
      this.settings['limitOneVote'] ||
      this.settings['approvalRequired'];
  }

  setSetting(payload: BooleanEmitPayload) {
    this.wsPollService.updates?.next({
      type: 'updateSetting',
      pollId: this.pollId,
      userId: this.userIdService.userId,
      setting: payload.identifier,
      newValue: payload.newValue,
    });
  }
}
