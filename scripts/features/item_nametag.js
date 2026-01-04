import { system, world } from "@minecraft/server";
import configAPI from "../api/config/configAPI";

configAPI.registerProperty("ItemNametags", configAPI.Types.Boolean, false)

// mraow~ :3
class ItemNametags {
    constructor() {
        this.enabled = false;
        this.interval = null;
    }
    enable() {
        if(this.enabled) return;
        this.enabled = true;
        this.interval = system.runInterval(()=>{
            world.getDimension('overworld').getEntities({
                type: 'minecraft:item'
            }).forEach(entity=>{
                let item = entity.getComponent('item');
                if(item) {
                    entity.nameTag = `§a${item.itemStack.typeId.split(':')[1].split('_').map(_=>`${_[0].toUpperCase()}${_.substring(1).toLowerCase()}`).join(' ')} §ex${item.itemStack.amount}`;
                }
            });
        }, 10)
    }
    disable() {
        if(!this.enabled) return;
        this.enabled = false;
        system.clearRun(this.interval)
        world.getDimension('overworld').getEntities({
            type: 'minecraft:item'
        }).forEach(entity=>{
            entity.nameTag = ""
        })
    }
}

let itemNametags = new ItemNametags();
// world.sendMessage("thing")
configAPI.db.waitLoad().then(()=>{
    if(configAPI.getProperty("ItemNametags")) {
        itemNametags.enable();
    }

    configAPI.onChangeProperty((prop, val)=>{
        if(prop != "ItemNametags") return;
        if(val) itemNametags.enable()
        else itemNametags.disable()
    })
})