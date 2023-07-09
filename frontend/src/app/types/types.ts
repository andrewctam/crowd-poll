
export interface Alert {
    msg: string,
    id: number,
    error: boolean
}


export interface StoredPoll {
    pollId: string,
    title: string
}


export interface CreatedPoll extends StoredPoll {
    selected: boolean
}


export interface PollSettings {
    hideVotes: boolean
    hideVotesForOwner: boolean
    approvalRequired: boolean
    autoApproveOwner: boolean
    disableVoting: boolean
    limitOneVote: boolean
}

export type Option = {
    approved: boolean
    optionTitle: string
    votes: number
    _id: string
}

export interface PollData {
    pollId: string
    title: string
    isOwner: boolean
    votedFor: string[]
    settings: PollSettings
    options: Option[]
}


export interface WSMessage extends Partial<PollData> {
    update?: string
    error?: string
    pong?: string
    success?: string
}

export interface ToggleSettingEmit {
    setting: string
    newValue: boolean
}


export type SortingMethod = "Order Created" | "Vote Count" | "Alphabetical Order"
export type FilterMethod = "All" | "Voted For" | "Not Voted For" | "Approved" | "Pending Approval"

export type PieArcDatum = d3.PieArcDatum<Option>;