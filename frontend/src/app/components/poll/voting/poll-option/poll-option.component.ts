import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { COLORS, EMPTY_POLL, GREEN_GRADIENT, LIGHTER_GREEN_GRADIENT } from 'src/app/constants/constants';
import { AlertService } from 'src/app/services/alert.service';
import { PollDataService } from 'src/app/services/poll-data.service';
import { SelectedChartService } from 'src/app/services/selected-chart.service';
import { SelectedDeleteService } from 'src/app/services/selected-delete.service';
import { UserIDService } from 'src/app/services/user-id.service';
import { WsPollService } from 'src/app/services/ws-poll.service';
import { Option, PollData } from 'src/app/types/types';

@Component({
  selector: 'poll-option',
  templateUrl: './poll-option.component.html',
})
export class PollOptionComponent {
  constructor(
      private alertService: AlertService,
      private pollDataService: PollDataService,
      private wsPollService: WsPollService,
      private userIdService: UserIDService,
      private selectedDeleteService: SelectedDeleteService,
      private selectedChartService: SelectedChartService
      ) { }

  @Input() option!: Option;

  pollData: PollData = EMPTY_POLL;
  voted: boolean = false;
  userId: string = "";
  selectedForDelete: boolean = false;
  selectedInChart: boolean = false;

  showBox: boolean = false;
  currentlyVoting: boolean = false;
  style = {};
  touchscreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

  
  ngOnInit() {
    this.pollDataService.pollData$.subscribe((pollData) => {
      if (pollData) {
        this.pollData = pollData;
        this.voted = pollData.votedFor.includes(this.option._id);
        this.currentlyVoting = false;
        this.updateStyles();
      }
    });

    this.userIdService.userId$.subscribe((userId) => {
      this.userId = userId;
    })

    this.selectedDeleteService.selectedDelete$.subscribe((sd) => {
      this.selectedForDelete = sd.includes(this.option._id);
    })

    this.selectedChartService.selectedChart$.subscribe((sc) => {
      this.selectedInChart = (sc === this.option._id);
    })
  }

  updateStyles() {
    this.style =  {
      borderColor: this.option?.approved === false ? COLORS.RED :
                    this.selectedForDelete ? COLORS.PINK :
                    this.currentlyVoting ? COLORS.LIGHER_GREEN :
                    this.voted ? COLORS.GREEN :
                               COLORS.WHITE,

      backgroundImage: this.currentlyVoting ? LIGHTER_GREEN_GRADIENT :
                      this.voted ? GREEN_GRADIENT
                          : "",

      transform: this.selectedInChart ? "scale(1.1)" : ""
    }     
  }


  toggleSelection(event: MouseEvent) {
    event?.stopPropagation();

    this.selectedDeleteService.toggleSelected(this.option._id);
    this.updateStyles();
  }


  castVote(event: MouseEvent) {
    event?.stopPropagation();

    if (!this.voted && this.pollData.votedFor.length > 0 && this.pollData.settings["limitOneVote"]) {
      this.alertService.addAlert("Already voted for another option!", 2000, true);
      return;
    }

    if (this.pollData.settings['disableVoting']) {
      this.alertService.addAlert('Voting is disabled', 2000, true);
      return;
    }
    
    if (!this.currentlyVoting) {
      this.currentlyVoting = true;
      this.updateStyles();
    } else {
      console.log("Wait for vote to finish");
    }

    const votedForThis = this.pollData.votedFor.includes(this.option._id);
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
      optionId: this.option._id,
      userId: this.userId,
    });
  }

  approveDenyOption(approved: boolean) {
    this.wsPollService.updates?.next({
      type: 'approveDenyOption',
      pollId: this.pollData.pollId,
      optionId: this.option._id,
      userId: this.userId,
      approved
    });
  }

}
