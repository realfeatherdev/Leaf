import { ModalFormData } from "@minecraft/server-ui";
import { prismarineDb } from "../lib/prismarinedb"
// import uiStorage from "../../uiStorage";
import { pluginsLoaded } from "../pluginStorage";
import { getPluginToggle } from "../pluginToggles";
import { world } from "@minecraft/server";
import uiManager from "../uiManager";
import versionData from "../versionData";
import { ActionForm } from "../lib/form_func";
import { NUT_UI_TAG, NUT_UI_THEMED } from "../uis/preset_browser/nutUIConsts";
import { themes } from "../uis/uiBuilder/cherryThemes";

export class ModuleToggler {
    constructor() {
        this.configEntry = {
            category: "root",
            data: {
                name: "§2Modules",
                subtext: "Enable/disable features",
                ui: "module_toggler",
                icon: "textures/ui/realms_slot_check"
            }
        }
        this.meow = 1;
        this.coreModule = true;
        this.id = "module_toggler"
    }
    load() {
        uiManager.addUI("modules", "yes", (player, moduleName = "root")=>{
            if(moduleName == "root") {
                let modules = Object.keys(pluginsLoaded).filter(_=>pluginsLoaded[_].parentModule ? false : true).sort((a,b)=>{
                    return (pluginsLoaded[b].coreModule ?? false) - (pluginsLoaded[a].coreModule ?? false)
                });
                let form = new ActionForm();
                form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§rModules`)
                for(const module of modules) {
                    let inst = pluginsLoaded[module];
                    form.button(`§${inst.coreModule ? "d" : "b"}${inst.displayName ? inst.displayName : inst.id}${inst.coreModule ? " [CORE]" : ""}\n§r§7${inst.id}`, inst.icon ? inst.icon : inst.configEntry && inst.configEntry.data && inst.configEntry.data.icon ? inst.configEntry.data.icon : "textures/azalea_icons/ExtIcon", (player)=>{

                    })
                }
                form.show(player, false, (player, response)=>{

                })
            }
        })
        return;
        uiManager.addUI("module_toggler", {}, (player)=>{
            let modalForm = new ModalFormData();
            modalForm.title("Modules");
            let modules = Object.keys(pluginsLoaded).filter(_=>pluginsLoaded[_].parentModule ? false : pluginsLoaded[_].coreModule ? false : true);
            for(const module of modules) {
                modalForm.toggle(`${pluginsLoaded[module].displayName ? pluginsLoaded[module].displayName : module}`, {
                    defaultValue: getPluginToggle(pluginsLoaded[module]),
                    tooltip: pluginsLoaded[module].description ?? undefined
                })
            }
            modalForm.show(player).then(res=>{
                if(res.canceled) uiManager.open(player, "config")
                for(let i = 0;i < res.formValues.length;i++) {
                    if(res.formValues[i] == getPluginToggle(pluginsLoaded[modules[i]])) continue;
                    if(res.formValues[i]) {
                        // world.getDynamicProperty(`pluginToggle:${pluginClass.id}`)
                        try {
                            pluginsLoaded[modules[i]].load();
                        } catch(e) {
                            let instance = pluginsLoaded[modules[i]]
                            try {
                                prismarineDb.getEventHandler("PluginLoader").emit("PluginFailed", {
                                    message: `${e}`,
                                    stack: e.stack,
                                    pluginClass: pluginsLoaded[modules[i]]
                                })
                            } catch(e) {
                                world.sendMessage(`§cMODULE ERROR §8§l>> §r§7Some unknown module did a huge meanie and tried breaking the addon :(`)
                            }
                            world.sendMessage(`§cMODULE ERROR §8§l>> §r§7Module "${instance.displayName ? instance.displayName : instance.id}" failed to load.`)
                        }
                        pluginsLoaded[modules[i]].enabled = true;
                        world.setDynamicProperty(`pluginToggle:${modules[i]}`, true)
                    } else {
                        if(pluginsLoaded[modules[i]].unload) {
                            pluginsLoaded[modules[i]].enabled = false;
                            pluginsLoaded[modules[i]].unload();
                        } else {
                            player.error(`Plugin "${modules[i]}" does not have an unload function. Please close and reopen your realm or restart your server and report this as a bug.`)
                        }
                        world.setDynamicProperty(`pluginToggle:${modules[i]}`, false)
                    }
                }
                uiManager.open(player, versionData.uiNames.ConfigRoot)
            })
        })
    }
}