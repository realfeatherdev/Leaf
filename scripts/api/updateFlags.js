import { system, world } from "@minecraft/server";
import configAPI from "./config/configAPI";

class UpdateFlags {
    constructor() {
        this.flags = [];

    }
    initialize() {
        system.afterEvents.scriptEventReceive.subscribe(e=>{
            if(e.id == "leaf:trigger_u") {
                this.triggerFlag(e.message)
            }
        })
    }
    addFlag(id, fn, desc) {
        let flag = this.flags.find(_=>_[0] == id)
        if(flag) return;
        this.flags.push([id, fn, desc]);
        if(!world.getDynamicProperty(`AOP_${id}x`)) { // idk why i chose AOP_{x}x to represent these but imma stick with it lol
            fn();
            world.setDynamicProperty(`AOP_${id}x`, true)
            if(configAPI.getProperty("DevMode")) world.sendMessage(`Triggering update flag: ${id} (Dynamic Property Key: AOP_${id}x)`)
        } else {}
    }
    triggerFlag(id) {
        let flag = this.flags.find(_=>_[0] == id)
        flag[1]()
        if(configAPI.getProperty("DevMode")) world.sendMessage(`Triggering update flag: ${id} (Dynamic Property Key: AOP_${id}x)`)
    }
}

export const updFlags = new UpdateFlags();