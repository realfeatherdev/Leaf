import { system, world } from "@minecraft/server";
import { prismarineDb } from "../lib/prismarinedb";
import { formatStr } from "../api/azaleaFormatting";
import configAPI from "../api/config/configAPI";
let MINUTE = 1000 * 60
// world.sendMessage("XRAY")
let config = [
    {
        blockType: 'minecraft:diamond_ore',
        resetTime: MINUTE * 20,
        flagAt: 31,
        flagMessage: "Player <name> flagged for mining a lot of diamond ore in a short period of time.",
    },
    {
        blockType: 'minecraft:ancient_debris',
        resetTime: MINUTE * 20,
        flagAt: 15,
        flagMessage: "Player <name> flagged for mining a lot of ancient debris in a short period of time.",
    }
]

let blockBreakMap = new Map();

function reset(data) {
    let keys = Object.keys(data);
    for(const key of keys) {
        if(Date.now() >= data[key].started + config.find(_=>_.blockType == key).resetTime) {
            data[key].amt = 0;
            data[key].started = Date.now();
        }
    }
    return data;
}

function get(playerID) {
    if(blockBreakMap.has(playerID)) {
        let newData = reset(blockBreakMap.get(playerID))
        blockBreakMap.set(playerID, newData);
        return newData;
    };
    let data = {};
    for(const block of config) {
        data[block.blockType] = {amt: 0, started: Date.now()};
    }
    blockBreakMap.set(playerID, data);
    return data;
}
function set(playerID, data) {
    blockBreakMap.set(playerID, data)
}

configAPI.registerProperty("XRayDetection", configAPI.Types.Boolean, false);

world.beforeEvents.playerBreakBlock.subscribe(e=>{
    if(!configAPI.getProperty("XRayDetection")) return;
    let type = e.block.typeId
    system.run(()=>{
        let prop = config.find(_=>_.blockType == type)
        if(!prop) return;
        let data = get(e.player.id);
        data[type].amt++;
        // world.sendMessage(`${data[type].amt}`)
        set(e.player.id, data);
        if(data[type].amt == prop.flagAt) {
            for(const player of world.getPlayers()) {
                if(!prismarineDb.permissions.hasPermission(player, "anticheat.logs")) continue;
                player.info(formatStr(prop.flagMessage, e.player));
            }
            e.player.warn(`You have been reported to the moderators for potential xraying. If this is a mistake, please feel free to report it to the staff.`)
        }
    })

})