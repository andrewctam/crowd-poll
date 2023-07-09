import { Component, Input, SimpleChanges } from '@angular/core';
import { EMPTY_POLL } from 'src/app/constants/constants';
import { AlertService } from 'src/app/services/alert.service';
import { PollDataService } from 'src/app/services/poll-data.service';
import { SelectedDeleteService } from 'src/app/services/selected-delete.service';
import { UserIDService } from 'src/app/services/user-id.service';
import { WsPollService } from 'src/app/services/ws-poll.service';
import {
  FilterMethod,
  Option,
  PollData,
  SortingMethod,
} from 'src/app/types/types';

@Component({
  selector: 'voting',
  templateUrl: './voting.component.html',
})
export class VotingComponent {
  constructor(
    private wsPollService: WsPollService,
    private userIdService: UserIDService,
    private pollDataService: PollDataService,
    private alertService: AlertService,
    private selectedDeleteService: SelectedDeleteService
  ) {}

  pollData: PollData = EMPTY_POLL;

  userId: string = '';

  userView: boolean = false;
  expandedTitle: boolean = false;
  optionInput: string = '';

  selectedDelete: string[] = [];
  pendingOptions: Option[] = [];

  sortingMethod: SortingMethod = 'Order Created';
  filterMethod: FilterMethod = 'All';

  ngOnInit() {
    this.userIdService.userId$.subscribe((userId) => {
      this.userId = userId;
    });

    this.pollDataService.pollData$.subscribe((pollData) => {
      if (pollData) {
        this.pollData = pollData;
        this.pendingOptions = [];
      }
    })

    this.selectedDeleteService.selectedDelete$.subscribe((sd) => {
      this.selectedDelete = sd;
    })
  }

  selectAll() {
    this.selectedDeleteService.selectAll();
  }

  deleteSelectedOptions() {
    this.wsPollService.updates?.next({
      type: 'deleteOptions',
      userId: this.userId,
      pollId: this.pollData.pollId,
      optionsToDelete: this.selectedDelete.join('.'),
    });

    this.selectedDeleteService.clear();
  }

  addOption() {
    if (this.optionInput === '') return;

    this.wsPollService.updates?.next({
      type: 'addOption',
      pollId: this.pollData.pollId,
      userId: this.userId,
      optionTitle: this.optionInput,
    });

    const approved =
      !this.pollData.settings['approvalRequired'] ||
      (this.pollData.isOwner &&
      !this.userView &&
      this.pollData.settings.autoApproveOwner);

    if (approved) {
      this.pendingOptions.push({
        approved: true,
        optionTitle: this.optionInput,
        votes: 0,
        _id: '',
      });
    }

    this.optionInput = '';
  }

  castVote(optionId: string) {
    if (this.pollData.settings['disableVoting']) {
      this.alertService.addAlert('Voting is disabled', 2000, true);
      return;
    }

    const votedForThis = this.pollData.votedFor.includes(optionId);
    const votedForAny = this.pollData.votedFor.length > 0;

    if (this.pollData.settings.limitOneVote && !votedForThis && votedForAny) {
      this.alertService.addAlert(
        'You can only vote for one option',
        2000,
        true
      );
      return;
    }

    this.wsPollService.updates?.next({
      type: 'vote',
      pollId: this.pollData.pollId,
      optionId: optionId,
      userId: this.userId,
    });
  }

  trackOption(index: number, option: Option) {
    return option._id;
  }
  setSortingMethod(method: string) {
    this.sortingMethod = method as SortingMethod;
  }

  setFilterMethod(method: string) {
    this.filterMethod = method as FilterMethod;
  }
}
