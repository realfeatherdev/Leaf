import { PlayerBreakBlockAfterEvent, PlayerPlaceBlockAfterEvent, system, world } from "@minecraft/server";
import configAPI from "../config/configAPI";
import { prismarineDb } from "../../lib/prismarinedb";
import { SegmentedStoragePrismarine } from "../../prismarineDbStorages/segmented";
import { getActivityScore, trackerInterval, vec3ToChunkCoordinates, XZToChunkCoordinates } from "./common";
import zones, { isInside2D } from "../zones";

let registered = false;

class PlayerActivityTracking {
    constructor() {
        this.chunkDB = prismarineDb.customStorage("ChunkTracking", SegmentedStoragePrismarine);
        this.keyval = null;
        this.chunkDB.waitLoad().then(()=>{
            this.keyval = this.chunkDB.keyval("ppballs")
        })
        this.init();
    }
    getChunkID(x, z) {
        let query = {
            x,z,
            t: 1
        }
        let doc = this.chunkDB.findFirst(query)
        if(doc) return doc.id;
        return this.chunkDB.insertDocument(query)
    }
    breakBlock(e) {
        if(!registered) return;
        if(!this.keyval) return;
        if(!(e instanceof PlayerBreakBlockAfterEvent)) return;
        let { location } = e.block;
        let {x, z} = vec3ToChunkCoordinates(location);
        let id = this.getChunkID(x, z);
        let doc = this.chunkDB.getByID(id);
        doc.data.lpa = Date.now();
        let ref = e.block.above(5)
        let underground = ref.isLiquid || ref.isSolid;
        this.incr(doc, underground ? "s1" : "s2") // s1 = underground block breaking, s2 = surface block breaking
        this.chunkDB.overwriteDataByID(doc.id, doc.data)
    }
    incr(doc, key) {
        // world.sendMessage(`Incrementing ${key} on ${doc.data.x}, ${doc.data.z}`)
        if(!doc.data.stats) doc.data.stats = [];
        let statIndex = doc.data.stats.findIndex(_=>_.t == trackerInterval.currentInterval)
        if(statIndex == -1) {
            doc.data.stats.push({t: trackerInterval.currentInterval, s: {}});
            statIndex = doc.data.stats.length - 1;
        }
        let curr = doc.data.stats[statIndex].s[key];
        if(!curr) {
            doc.data.stats[statIndex].s[key] = 1;
        } else {
            doc.data.stats[statIndex].s[key] = curr + 1;
        }
        // world.sendMessage(`New stats for ${key}: ${doc.data.stats[statIndex].s[key]}`)
    }
    getChunkScore(x, z, ignoreNearby = false) {
        let doc = this.chunkDB.findFirst({t: 1, x, z});
        if(zones) {
            for(const zone of zones.zonesDB.data) {
                if(zone.data.type != "ZONE") continue;
                let coords = {
                    start: XZToChunkCoordinates(zone.data.x1, zone.data.z1),
                    end: XZToChunkCoordinates(zone.data.x2, zone.data.z2)
                }
                if(isInside2D(x, z, coords.start, coords.end)) return 99;
            }
        }
        // if(!doc) return 0;
        return getActivityScore({
            influence: {
                maxDistance: configAPI.getProperty("ChunkActivityNeighborInfluenceMaxDistance"),
                falloffRate: configAPI.getProperty("ChunkActivityNeighborInfluenceFalloffRate"),     // decent dropoff, still lets close chunks matter
                influenceStrength: configAPI.getProperty("ChunkActivityNeighborInfluenceStrength")
            },
            nearbyScores: ignoreNearby ? [] : this.chunkDB.findDocuments({t:1}).filter(_=>_.data.x !== x || _.data.z !== z).map(_=>({x: _.data.x, z: _.data.z, score: this.getChunkScore(_.data.x, _.data.z, true)})),
            position: {x, z},
            stats: {
                s1: !doc ? [0] : this.getStats(doc, "s1"),
                s2: !doc ? [0] : this.getStats(doc, "s2"),
                s3: !doc ? [0] : this.getStats(doc, "s3"),
                s4: !doc ? [0] : this.getStats(doc, "s4"),
            },
            weights: {
                s1: configAPI.getProperty("ChunkActivityUndergroundBreakingWeight"),  // underground breaking — important, but lower b/c mining can be AFK or repetitive
                s2: configAPI.getProperty("ChunkActivitySurfaceBreakingWeight"),  // above ground breaking — lots of manual effort, good sign of surface activity
                s3: configAPI.getProperty("ChunkActivityUndergroundPlacingWeight"),  // underground placing — less value, probably torches or spam blocks
                s4: configAPI.getProperty("ChunkActivitySurfacePlacingWeight")   // above ground placing — BIGGEST activity marker (builders gonna build)
            }
        })
    }
    getStats(doc, key) {
        if(!doc.data.stats) return [0];
        let sorted = doc.data.stats.sort((a, b)=>a.t - b.t);
        let stats = [];
        for(let i = sorted[0].t;i < sorted[sorted.length - 1].t + 1;i++) {
            let stat = sorted.find(_=>_.t == i);
            if(!stat) stats.push(0);
            stats.push(stat.s && stat.s[key] ? stat.s[key] : 0)
        }
        // world.sendMessage(JSON.stringify(stats))
        return stats;
    }
    placeBlock(e) {
        if(!registered) return;
        if(!this.keyval) return;
        if(!(e instanceof PlayerPlaceBlockAfterEvent)) return;
        let { location } = e.block;
        let {x, z} = vec3ToChunkCoordinates(location);
        let id = this.getChunkID(x, z);
        let doc = this.chunkDB.getByID(id);
        doc.data.lpa = Date.now();
        let ref = e.block.above(5)
        let underground = ref.isLiquid || ref.isSolid;
        this.incr(doc, underground ? "s3" : "s4") // s3 = underground block breaking, s4 = surface block breaking
        this.chunkDB.overwriteDataByID(doc.id, doc.data)

    }
    interactWithBlock(e) {
        if(!this.keyval) return;

    }
    register() {
        registered = true;
        // if(configAPI.getProperty("DevMode")) world.sendMessage("Registered Chunk Tracking Module")
    }
    unregister() {
        registered = false;
        // if(configAPI.getProperty("DevMode")) world.sendMessage("Unregistered Chunk Tracking Module")
        // world.afterEvents.playerBreakBlock.unsubscribe(this.breakBlock)
        // world.afterEvents.playerPlaceBlock.unsubscribe(this.placeBlock)
        // world.afterEvents.playerInteractWithBlock.unsubscribe(this.interactWithBlock)
    }
    init() {
        world.afterEvents.playerBreakBlock.subscribe(this.breakBlock.bind(this))
        world.afterEvents.playerPlaceBlock.subscribe(this.placeBlock.bind(this))
        world.afterEvents.playerInteractWithBlock.subscribe(this.interactWithBlock.bind(this))
    }
}

let playerActivityTracking = new PlayerActivityTracking();

configAPI.registerProperty("ChunkTracking", configAPI.Types.Boolean, true)
configAPI.registerProperty("ChunkActivityUndergroundBreakingWeight", configAPI.Types.Number, 0.6)
configAPI.registerProperty("ChunkActivitySurfaceBreakingWeight", configAPI.Types.Number, 2.5)
configAPI.registerProperty("ChunkActivityUndergroundPlacingWeight", configAPI.Types.Number, 0.4)
configAPI.registerProperty("ChunkActivitySurfacePlacingWeight", configAPI.Types.Number, 3.5)
configAPI.registerProperty("ChunkActivityNeighborInfluenceMaxDistance", configAPI.Types.Number, 8)
configAPI.registerProperty("ChunkActivityNeighborInfluenceFalloffRate", configAPI.Types.Number, 0.8)
configAPI.registerProperty("ChunkActivityNeighborInfluenceStrength", configAPI.Types.Number, 0.45)

configAPI.onChangeProperty((property, value)=>{
    if(property != "ChunkTracking") return;
    if(value && !registered) {
        playerActivityTracking.register()
    } else if(!value && registered) {
        playerActivityTracking.unregister();
    }
})

configAPI.db.waitLoad().then(()=>{
    system.runTimeout(()=>{
        if(configAPI.getProperty("ChunkTracking")) playerActivityTracking.register();
    },10)
})

export default playerActivityTracking;