import { Component, Input, SimpleChanges } from '@angular/core';
import { COLORS, EMPTY_POLL, GREEN_GRADIENT } from 'src/app/constants/constants';
import { AlertService } from 'src/app/services/alert.service';
import { PollDataService } from 'src/app/services/poll-data.service';
import { PollErrorService } from 'src/app/services/poll-error.service';
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
    private selectedChartService: SelectedChartService,
    private pollErrorService: PollErrorService) {}

  @Input() option!: Option;

  pollData: PollData = EMPTY_POLL;
  isVoted: boolean = false;
  userId: string = "";
  selectedForDelete: boolean = false;
  selectedInChart: boolean = false;

  showBox: boolean = false;
  voteAdjustment: number = 0;
  currentlyVoting: boolean = false;
  style = {};
  touchscreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

  
  ngOnInit() {
    this.pollDataService.pollData$.subscribe((pollData) => {
      if (pollData) {
        this.pollData = pollData;
        const newVoteStatus = pollData.votedFor.includes(this.option._id);

        if (newVoteStatus !== this.isVoted) {
          this.currentlyVoting = false;
          this.voteAdjustment = 0;
        }

        this.isVoted = newVoteStatus;
      }
    });

    this.pollErrorService.pollError$.subscribe((error) => {
      if (error !== "") {
        this.currentlyVoting = false;
        this.voteAdjustment = 0;
  
      }
    })

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

  ngDoCheck() {
    const showVote = (this.currentlyVoting && !this.isVoted) || (!this.currentlyVoting && this.isVoted);
    this.style = {
      borderColor: (this.option?.approved === false ? COLORS.RED :
                   this.selectedForDelete ? COLORS.PINK :
                   showVote ? COLORS.GREEN :
                              COLORS.WHITE),

      backgroundImage: showVote ? GREEN_GRADIENT : "",

      transform: this.selectedInChart ? "scale(1.1)" : ""
    }     
  }


  toggleSelection(event: MouseEvent) {
    event?.stopPropagation();
    this.selectedDeleteService.toggleSelected(this.option._id);
  }

  castVote(event: MouseEvent) {
    event?.stopPropagation();

    if (!this.isVoted && this.pollData.votedFor.length > 0 && this.pollData.settings["limitOneVote"]) {
      this.alertService.addAlert("Already voted for another option!", 2000, true);
      return;
    }

    if (this.pollData.settings['disableVoting']) {
      this.alertService.addAlert('Voting is disabled', 2000, true);
      return;
    }
    
    if (!this.currentlyVoting) {
      this.currentlyVoting = true;

    } else {
      console.log("Wait for vote to finish");
    }

    const votedForAny = this.pollData.votedFor.length > 0;

    if (this.pollData.settings.limitOneVote && !this.isVoted && votedForAny) {
      this.alertService.addAlert(
        'You can only vote for one option',
        2000,
        true
      );
      return;
    }

    if (this.isVoted) {
      this.voteAdjustment = -1;
    } else {
      this.voteAdjustment = 1;
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

  getLabel() {
    if (this.option.votes < 0) {
      return "Votes Hidden";
    }

    const effectiveVotes = this.option.votes + this.voteAdjustment; 
    return `${effectiveVotes} ${effectiveVotes === 1 ? " vote" : " votes"}`;
  }

}
