import { Component, Input } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { UserIDService } from 'src/app/services/user-id.service';
import { WsPollService } from 'src/app/services/ws-poll.service';
import { BooleanEmitPayload, FilterMethod, PollData, SortingMethod } from 'src/app/types/types';

@Component({
  selector: 'voting',
  templateUrl: './voting.component.html',
})
export class VotingComponent {
  constructor(
    private wsPollService: WsPollService,
    private userIdService: UserIDService,
    private alertService: AlertService
  ) {}

  @Input() pollData!: PollData;
  @Input() selectedSlice!: string;

  userView: boolean = false;
  expandedTitle: boolean = false;
  selectedOptions: string[] = [];
  optionInput: string = '';

  sortingMethod: SortingMethod = "Order Created";
  filterMethod: FilterMethod = "All";

  selectAll() {
    if (this.selectedOptions.length === this.pollData.options.length) {
      this.selectedOptions = [];
    } else {
      this.selectedOptions = this.pollData.options
        .filter((o) => o.approved)
        .map((o) => o._id);
    }
  }

  toggleSelected(optionId: string) {
    const i = this.selectedOptions.findIndex((id) => id === optionId);

    if (i >= 0) {
      this.selectedOptions.splice(i, 1);
    } else {
      this.selectedOptions.push(optionId);
    }
  }

  deleteSelectedOptions() {
    this.wsPollService.updates?.next({
      type: 'deleteOptions',
      userId: this.userIdService.userId,
      pollId: this.pollData.pollId,
      optionsToDelete: this.selectedOptions.join('.'),
    });
  }

  addOption() {
    if (this.optionInput === '') return;

    this.wsPollService.updates?.next({
      type: 'addOption',
      pollId: this.pollData.pollId,
      userId: this.userIdService.userId,
      optionTitle: this.optionInput,
    });

    this.optionInput = '';
  }

  castVote(optionId: string) {
    if (this.pollData.settings['disableVoting']) {
      this.alertService.addAlert('Voting is disabled', 2000, 'error');
      return;
    }

    const votedForThis = this.pollData.votedFor.includes(optionId);
    const votedForAny = this.pollData.votedFor.length > 0;

    if (this.pollData.settings.limitOneVote && !votedForThis && votedForAny) {
      this.alertService.addAlert(
        'You can only vote for one option',
        2000,
        'error'
      );
      return;
    }

    this.wsPollService.updates?.next({
      type: 'vote',
      pollId: this.pollData.pollId,
      optionId: optionId,
      userId: this.userIdService.userId,
    });
  }

  approveDenyOption(payload: BooleanEmitPayload) {
    this.wsPollService.updates?.next({
      type: 'approveDenyOption',
      pollId: this.pollData.pollId,
      optionId: payload.identifier,
      userId: this.userIdService.userId,
      approved: payload.newValue,
    });
  }

  setSortingMethod(method: string) {
    this.sortingMethod = method as SortingMethod;
  }

  setFilterMethod(method: string) {
    this.filterMethod = method as FilterMethod;
  }
  
}
