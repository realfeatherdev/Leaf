import { world } from "@minecraft/server";
import { pluginsLoaded } from "./pluginStorage";

export function getPluginToggleByID(id) {
    try {
        let data = world.getDynamicProperty(`pluginToggle:${id}`);
        if(typeof data == "boolean") {
            return data;
        } else {
            let pluginClass = pluginsLoaded[id]
            return pluginClass ? pluginClass.enabledByDefault ? true : false : false;
        }
    } catch {
        let pluginClass = pluginsLoaded[id]
        return pluginClass ? pluginClass.enabledByDefault ? true : false : false;
    }

}

export function getPluginToggle(pluginClass) {
    if(pluginClass.parentModule) {
        return getPluginToggleByID(pluginClass.parentModule)
    }
    if(pluginClass.coreModule) return true;
    try {
        let data = world.getDynamicProperty(`pluginToggle:${pluginClass.id}`);
        if(typeof data == "boolean") {
            return data;
        } else {
            return pluginClass.enabledByDefault ? true : false;
        }
    } catch {
        return pluginClass.enabledByDefault ? true : false;
    }
}