import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { BooleanEmitPayload, Option } from 'src/app/types/types';

@Component({
  selector: 'poll-option',
  templateUrl: './poll-option.component.html',
})
export class PollOptionComponent {

  @Input() data!: Option;
  @Input() isOwner!: boolean;
  @Input() voted!: boolean;
  @Input() selectedDelete!: boolean;
  @Input() selectedSlice!: boolean;

  @Output() toggleSelected = new EventEmitter<string>();
  @Output() castVote = new EventEmitter<string>();
  @Output() approveDeny = new EventEmitter<BooleanEmitPayload>();
  
  showBox: boolean = false;
  touchscreen = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

  currentlyVoting: boolean = false;

  borderColor: string = "";
  backgroundImage: string = "";
  transform: string = "";
  updateStyles() {
    this.borderColor = (
      this.data?.approved === false ? "rgb(255, 0, 0)" :
                this.selectedDelete ? "rgb(255, 127, 127)" :
               this.currentlyVoting ? "rgb(200, 236, 180)" :
                         this.voted ? "rgb(154, 236, 180)" :
                                      "rgb(255, 255, 255)"
    );

    this.transform = this.selectedSlice ? "scale(1.1)" : "";
    this.backgroundImage = this.voted ? "linear-gradient(to right, rgb(89 100 90), rgb(92 92 90))" : "";          
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["data"] || changes["selectedDelete"] || changes["voted"] || changes["currentlyVoting"] || changes["selectedSlice"]) {
      this.updateStyles();
    }
  }

  vote(event: MouseEvent) {
    event?.stopPropagation();

    if (!this.currentlyVoting) {
      this.currentlyVoting = true;
      this.castVote.emit(this.data._id);
      this.updateStyles();
    } else {
      console.log("Wait for vote to finish");
    }
  }

  toggleSelection(event: MouseEvent) {
    event?.stopPropagation();

    this.toggleSelected.emit(this.data._id);
  }

  approveDenyOption(approved: boolean) {
    this.approveDeny.emit({
      identifier: this.data._id, 
      newValue: approved
    });
  }
}
