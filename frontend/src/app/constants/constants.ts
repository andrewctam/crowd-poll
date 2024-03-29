import { PollData } from "../types/types"

export const EMPTY_POLL: PollData = {
    pollId: "",
    title: "",
    isOwner: false,
    votedFor: [],
    settings: {
        hideVotes: false,
        hideVotesForOwner: false,
        approvalRequired: false,
        autoApproveOwner: false,
        disableVoting: false,
        limitOneVote: false
    },
    options: []
}

export const COLORS = {
    RED: "rgb(255, 0, 0)",
    PINK: "rgb(255, 127, 127)",
    GREEN: "rgb(154, 236, 180)",
    WHITE: "rgb(255, 255, 255)",
}

export const GREEN_GRADIENT = "linear-gradient(to right, rgb(89, 100, 90), rgb(92, 92, 90))";

export const CHART_RADIUS = 200;
