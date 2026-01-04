import { createMessage } from "../../createMessage";

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