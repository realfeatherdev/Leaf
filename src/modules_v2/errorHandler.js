import { world } from "@minecraft/server";
import { prismarineDb } from "../lib/prismarinedb";
import { ActionFormData } from "@minecraft/server-ui";
import uiManager from "../uiManager";

export class ErrorHandlerModule {
    constructor() {
        this.name = "Leaf Error Handler"
        this.id = "error_handler";
        let failedPlugins = [];
        this.failedPlugins = failedPlugins;
        this.configEntry = {
            category: "root",
            data: {
                name: "§cError Handler",
                subtext: ()=> {
                    return `View errors (${this.failedPlugins.length})`
                },
                conditional: ()=> {
                    return this.failedPlugins.length > 0
                },
                icon: "textures/items/diamond",
                ui: "error_logs"
            }
        }
        this.enabledByDefault = true;
        this.coreModule = true; // This makes it so this module cant be disabled. Config UI is required for leaf essentials
        this.enabled = false;
    }
    load() {
        this.failedPlugins = [];
        this.enabled = true;
        prismarineDb.getEventHandler("PluginLoader").on("PluginFailed", data=>{
            this.failedPlugins.push(data)
        })
        uiManager.addUI("error_logs", {}, (player)=>{
            let form = new ActionFormData();
            form.title("§cError Logs");
            let errors = [];
            for(const fail of this.failedPlugins) {
                errors.push(`Plugin "${fail.pluginClass ? fail.pluginClass.name ? fail.pluginClass.name : fail.pluginClass.id : "Unknown"}" failed to load.\n§c${fail.message} §4(${fail.stack})`)
            }
            form.body(errors.join('\n\n§r§f'));
            form.button("Ok")
            form.show(player).then(res=>{
                // uiManager.open("config", player, "root")
            })
        })
    }
    unload() {
        world.sendMessage("Attempted unloading error handler, it failed.")
    }
}