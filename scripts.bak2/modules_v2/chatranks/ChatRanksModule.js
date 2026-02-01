import playerStorage from "../../api/playerStorage";
import { createMessage } from "../../createMessage";
import { bansDB } from "../../uis/moderation_hub/bans";
import moment from '../../lib/moment'
export class ChatRanksModule {
    constructor() {
        this.id = "ranks";
        this.displayName = "Chat Ranks";
        this.enabled = false;
        this.enabledByDefault = true;
        this.chatModifier = {
            isEnabled: ()=>{
                return this.enabled;
            },
            customMessageHandler: (msg, customMessage)=>{
                let id = playerStorage.getID(msg.sender);
                let mute = bansDB.findFirst({type: "MUTE", playerID: id})
                if(mute) {
                    msg.sender.error(`You are muted ${mute.data.permanent ? `permanently.` : `temporarily. You will be unmuted ${moment(mute.data.expirationDate).fromNow()}`}`)
                    return ["", true]
                }
                let yes = createMessage(msg.sender, msg.message);
                if(yes.includes("§{ERRNO1")) {
                    msg.sender.error("Failed to send message due to bad formatting")
                    return ["", true];
                } else {
                    return [yes, false]
                }
            }
        }
    }

    load() {this.enabled = true}
    unload() {this.enabled = false}
}