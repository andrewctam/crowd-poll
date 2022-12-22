import SettingCheckBox from './SettingCheckBox';
import SettingListDisplay from './SettingListDisplay';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { PollSettings } from '../App';


interface SettingsProps {
    ws: W3CWebSocket
    isOwner: boolean
    pollId: string
    userId: string
    settings: PollSettings
}

function Settings(props: SettingsProps) {
    if (props.isOwner) {
        return (
            <div className="bg-slate-600 mt-4 p-3 w-fit mx-auto rounded-xl shadow-md">
                <h1 className='text-white text-2xl mb-2 font-semibold'>Settings</h1>
                <SettingCheckBox ws={props.ws} text="Disable Voting" name="disableVoting" indent={false} pollId={props.pollId} userId={props.userId} active={props.settings["disableVoting"]} />

                <SettingCheckBox ws={props.ws} text="Hide Vote Count" name="hideVotes" indent={false} pollId={props.pollId} userId={props.userId} active={props.settings["hideVotes"]} />

                {props.isOwner && props.settings["hideVotes"] ?
                    <SettingCheckBox ws={props.ws} text="Hide Vote Count For You" name="hideVotesForOwner" indent={true} pollId={props.pollId} userId={props.userId} active={props.settings["hideVotesForOwner"]} />
                    : null}

                <SettingCheckBox ws={props.ws} text="Limit Users To One Vote" name="limitOneVote" indent={false} pollId={props.pollId} userId={props.userId} active={props.settings["limitOneVote"]} />

                <SettingCheckBox ws={props.ws} text="New Options Require Approval" name="approvalRequired" indent={false} pollId={props.pollId} userId={props.userId} active={props.settings["approvalRequired"]} />

                {props.isOwner && props.settings["approvalRequired"] ?
                    <SettingCheckBox ws={props.ws} text="Auto Approve Your Options" name="autoApproveOwner" indent={true} pollId={props.pollId} userId={props.userId} active={props.settings["autoApproveOwner"]} />
                    : null}

            </div>)

    } else if (props.settings["disableVoting"] || props.settings["hideVotes"] || props.settings["limitOneVote"] || props.settings["approvalRequired"]) {
        return (
            <div className="p-4 rounded-xl mx-auto w-fit mt-4 bg-slate-600 shadow-md">
                <h1 className="text-center text-2xl font-semibold pt-1 text-white select-none mb-3">Settings</h1>

                <ul className="text-left">
                    <SettingListDisplay text="Adding and removing votes is disabled" display={props.settings["disableVoting"]} />
                    <SettingListDisplay text="Vote counts are hidden" display={props.settings["hideVotes"]} />
                    <SettingListDisplay text="You may only cast one vote at a time" display={props.settings["limitOneVote"]} />
                    <SettingListDisplay text="New options require approval from the owner" display={props.settings["approvalRequired"]} />
                </ul>
            </div>
        )

    } else 
        return null;
}

export default Settings;