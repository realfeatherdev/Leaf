import { world } from "@minecraft/server";
import { prismarineDb } from "../../lib/prismarinedb";
import CommandManager from "../../api/commands/commandManager"
import uiBuilder from "../../api/uiBuilder";

export class ChatModule {
    constructor() {
        this.id = "chat";
        this.displayName = "Chat Handler"
        this.icon = "textures/azalea_icons/Chat"
        this.coreModule = true;
        this.plugins = [];
    }
    load() {
        prismarineDb.getEventHandler("PluginLoader").on("PluginLoaded", data=>{
            if(!data.pluginClass || !data.pluginClass.chatModifier) return;
            this.plugins.push(data.pluginClass.chatModifier)
        })

        world.beforeEvents.chatSend.subscribe(e=>{
            if (e.message.startsWith(CommandManager.prefix)) {
                // u need to create an instance of command manager will that work
                e.cancel = true;
                CommandManager.run(e);
                return;
            }
            let customMessage = "";
            for(const plugin of this.plugins) {
                if(plugin.isEnabled() && plugin.customMessageHandler) {
                    let [customMessage2, cancel] = plugin.customMessageHandler(e, customMessage) ?? "";
                    if(!cancel) customMessage = customMessage2;
                    else {
                        e.cancel = true;
                        return;
                    }
                }
            }

            if(customMessage) {
                e.cancel = true;
                let exclude = [];
                for(const player of world.getPlayers()) {
                    if(this.plugins.some(plugin=> plugin.isEnabled() && plugin.playerFilter && !plugin.playerFilter(player, e))) exclude.push(player.id)
                }

                uiBuilder.playerBroadcast(e.sender, customMessage, exclude, true)
            }
        })
    }
}