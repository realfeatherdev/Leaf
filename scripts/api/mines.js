import { system, world } from "@minecraft/server";
import { normalizePercentages, weightedRandomIndex } from "./commonFunctions";
import uiBuilder from "./uiBuilder";
import zones from "./zones";
import configAPI from "./config/configAPI";
configAPI.registerProperty("MineZonesMaxVolume", configAPI.Types.Number, 2 ** 16)

class Mines {
    constructor() {
        this.CUSTOMIZER_TYPE = 19;
        this.startHandler()
    }
    startHandler() {
        system.runInterval(()=>{
            for(const mine of uiBuilder.db.findDocuments({type: this.CUSTOMIZER_TYPE})) {
                try {
                    if(!mine.data.nextRefill) {
                        mine.data.nextRefill = Date.now() + mine.data.refillTimeMS;
                        let mine2 = uiBuilder.db.data.find(_=>_.id == mine.id);
                        mine2.data = mine.data;
                        uiBuilder.db.save();
                    }
                    if(Date.now() >= mine.data.nextRefill) {
                        // mine.data.nextRefill = Date.now() + mine.data.refillTimeMS;
                        // uiBuilder.db.overwriteDataByID(mine.id, mine.data);
                        mine.data.nextRefill = Date.now() + mine.data.refillTimeMS;
                        let mine2 = uiBuilder.db.data.find(_=>_.id == mine.id);
                        mine2.data = mine.data;
                        uiBuilder.db.save();
                        this.refill(mine);
                    }
                } catch {}
            }
        },20);
    }
    refill(mine) {
        let zone = uiBuilder.db.getByID(mine.data.zoneID);
        if(!zone) return; // no zone
        let zoneVolume = zones.zoneDataToVolume(zone);
        let normalized = normalizePercentages(mine.data.chances)
        let dim = world.getDimension('overworld');
        try {
            dim = zone.data.dim ? world.getDimension(zone.data.dim) : world.getDimension("overworld")
        } catch {
            dim = world.getDimension("overworld")
        }
        const minX = Math.floor(Math.min(zoneVolume.start.x, zoneVolume.end.x)) // minimum balls
        const minY = Math.floor(Math.min(zoneVolume.start.y, zoneVolume.end.y)) // y balls?
        const minZ = Math.floor(Math.min(zoneVolume.start.z, zoneVolume.end.z)) // z balls.
        const maxX = Math.floor(Math.max(zoneVolume.start.x, zoneVolume.end.x)) // MAXIMUM BALLS!!!
        const maxY = Math.floor(Math.max(zoneVolume.start.y, zoneVolume.end.y))
        const maxZ = Math.floor(Math.max(zoneVolume.start.z, zoneVolume.end.z))
        const sizeX = maxX - minX + 1;
        const sizeY = maxY - minY + 1;
        const sizeZ = maxZ - minZ + 1;
        const volume = sizeX * sizeY * sizeZ;
        if(volume > configAPI.getProperty("MineZonesMaxVolume")) return;
        if(!dim.isChunkLoaded(zoneVolume.start) || !dim.isChunkLoaded(zoneVolume.end)) return;
        function* generator() { // my brain
            for(let x = minX; x <= maxX; x++) { // function* = generator btw
                // dont ask. idk wtf js generators are either
                for(let y = minY; y <= maxY; y++) {
                    for(let z = minZ; z <= maxZ; z++) {
                        let random = weightedRandomIndex(normalized);
                        let block = mine.data.blockTypeIDs[random];
                        let existingBlock = dim.getBlock({x, y, z});
                        if(existingBlock.typeId == "minecraft:air") dim.setBlockType({x, y, z}, block);
                        yield; // yield balls
                    }
                }
            }
        }
        // const region = regiongenerator(zoneVolume.start, zoneVolume.end);
        system.runJob(generator()) // give me a job uwu
        // mcdonalds cashier
        // blowjob dumbfuck
        // erm
    }
    // opinion on the random ass jsdoc stuff i use randomly in leaf?
    // i feel bad for ur codebase
    // why
    // such useful jsdoc ngl
    /**
    @param {any[][]} choices
    **/
    random(choices) {
        let percentages = normalizePercentages(choices.map(_=>_[0]));
        let values = choices.map(_=>_[1]);
        return values[weightedRandomIndex(percentages)];
    }
}

export const minesAPI = new Mines();