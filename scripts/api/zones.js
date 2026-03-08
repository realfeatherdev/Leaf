import { EntityInitializationCause, EquipmentSlot, Player, system, world } from "@minecraft/server";
import { prismarineDb } from "../lib/prismarinedb";
import { SegmentedStoragePrismarine } from "../prismarineDbStorages/segmented";
import landclaims from "./landclaims/landclaims";
import playerStorage from "./playerStorage";
import uiBuilder from "./uiBuilder";
import configAPI from "./config/configAPI";
import OpenClanAPI from "./OpenClanAPI";
// import { getScore } from "./formatting/scores";
function getScore(obj, p) {
    let obj2 = world.scoreboard.getObjective(obj);
    let score = 0;
    try {
        score = obj2.getScore(p)
    } catch {score = 0}
    return score;
}

export function stripMinecraft(id) {
    return id.startsWith('minecraft:') ? id.replace('minecraft:', '') : id;
}
export function includesAdv(list, id) {
    let includes = false;
    for(const item of list) {
        if(item == "*") includes = !includes;
        if(stripMinecraft(item) == stripMinecraft(id)) includes = !includes;
    }
    return includes;
}
export function isPointInCube(px, py, pz, x1, y1, z1, x2, y2, z2) {
    // Ensure the coordinates are ordered correctly (min and max)
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);

    // Check if the point is within the cube bounds
    return (
        px >= minX &&
        px <= maxX &&
        py >= minY &&
        py <= maxY &&
        pz >= minZ &&
        pz <= maxZ
    );
}
export function isInCuboid(p, loc1, loc2) {
    return isPointInCube(p.x, p.y, p.z, loc1.x, loc1.y, loc1.z, loc2.x, loc2.y, loc2.z)
}
configAPI.registerProperty("NoHitLowerTier", configAPI.Types.Boolean, false);
class Zones {
    constructor() {
        this.zonesDB = prismarineDb.customStorage(
            "Zones",
            SegmentedStoragePrismarine
        );
        this.flags = [
            "DisallowBlockPlacing",
            "DisallowBlockBreaking",
            "DisallowAllBlockInteractions",
            "DisallowLeverInteractions",
            "DisallowTrapdoorInteractions",
            "DisableDoorInteractions",
            "DisableChestInteractions",
            "DisablePVP",
            "DisallowCustomInteractions",
            "DisallowLogStripping",
            "DisallowLandClaiming",
            "DisallowGenPlacing",
            "DisallowMobSpawning",
            "DisallowExplosions",
            "NoHitLowerTier",
            "ForceAllowHitLowerTier"
        ];
        this.initEvents();
        this.msg = "You cant do this here";
    }
    getTierFromItem(item) {
        if(!item) return 0;
        let id = item.typeId;
        return id.includes('leather') ? 1 : id.includes('chainmail') ? 2 : id.includes('copper') ? 3 : id.includes('gold') ? 4 : id.includes('diamond') ? 6 : id.includes('iron') ? 5 : id.includes('netherite') ? 7 : 0;
    }
    getTier(player) {
        if(!(player instanceof Player)) return;

        let equippable = player.getComponent('equippable')
        let head = equippable.getEquipment(EquipmentSlot.Head)
        let chest = equippable.getEquipment(EquipmentSlot.Chest)
        let legs = equippable.getEquipment(EquipmentSlot.Legs)
        let feet = equippable.getEquipment(EquipmentSlot.Feet) // No foot fetishes! >:( Bad girl!

        return Math.max(
            this.getTierFromItem(head),
            this.getTierFromItem(chest),
            this.getTierFromItem(legs),
            this.getTierFromItem(feet),
        )
    }
    initEvents() {
        try {
            system.run(()=>{
                // world.scoreboard.addObjective("leaf:team", "Team") UNUSED!
            })
        } catch {}
        system.afterEvents.scriptEventReceive.subscribe(e=>{
            if(e.id == "leaf:switch_team" && e.sourceEntity && e.sourceEntity.typeId == "minecraft:player") {
                let team = e.message ? e.message : "default";
                for(const tag of e.sourceEntity.getTags()) {
                    if(tag.startsWith('team:')) e.sourceEntity.removeTag(tag);
                }
                if(team != "default") e.sourceEntity.addTag(`team:${team}`)
            }
        })
        world.beforeEvents.entityHurt.subscribe(e=>{
            if(e.damageSource.damagingEntity && e.damageSource.damagingEntity.typeId == "minecraft:player" && e.hurtEntity.typeId == "minecraft:player") {
                let FLAG = "DisablePVP";
                let zone = this.getZoneAtVec3(e.hurtEntity.location, e.hurtEntity.dimension);
                if(zone && zone.data.flags.includes("DisablePVP")) {
                    e.cancel = true;
                }
                function yes(tags, pre, d = "default") {
                    let tag = tags.find(_=>_.startsWith(pre))
                    if(tag) return tag.substring(pre.length)
                    return d;
                }
                let teamWS = yes(e.damageSource.damagingEntity.getTags(), "team:", "default")
                // let teamWS = getScore("leaf:team", e.damageSource.damagingEntity)

                let teamCR = yes(e.hurtEntity.getTags(), "team:", "default")
                // let teamCR = getScore("leaf:team", e.damageSource.hurtEntity)
                // world.sendMessage(`D: ${teamWS}, H: ${teamCR}`)
                if(teamWS == teamCR && teamWS != "default" && teamCR != "default") e.cancel = true;

                let WS = e.damageSource.damagingEntity;
                let CR = e.hurtEntity;
                if(configAPI.getProperty("Clans")) {
                    let clanWS = OpenClanAPI.getClanID(WS);
                    let clanCR = OpenClanAPI.getClanID(CR);
                    if(clanWS && clanCR && clanWS == clanCR && configAPI.getProperty("clans:disable_friendly_fire")) e.cancel = true;
                }
                // let NoHitLowerTier = configAPI.getProperty("NoHitLowerTier");
                // world.sendMessage(`${NoHitLowerTier ? "true" : "false"}`)
                // console.warn(NoHitLowerTier)
                if(configAPI.getProperty("NoHitLowerTier") || (zone && zone.data.flags.includes("NoHitLowerTier"))) {
                    if(zone && zone.data.flags.includes("ForceAllowHitLowerTier")) return;
                    // world.sendMessage("YES")
                    let tierWS = this.getTier(WS);
                    let tierCR = this.getTier(CR);
                    if(tierWS != tierCR) e.cancel = true;
                }
            }
        })
        world.beforeEvents.explosion.subscribe(e=>{
            let newBlocks = [];
            for(const block of e.getImpactedBlocks()) {
                let zone = this.getZoneAtVec3(block.location, block.dimension)
                // let isA = ( && e)
                if(zone && zone.data.flags.includes("DisallowExplosions")) continue;
                newBlocks.push(block)
            }
            e.setImpactedBlocks(newBlocks)
        })
        world.beforeEvents.playerPlaceBlock.subscribe((e) => {
            let zone = this.getZoneAtVec3(e.block.location, e.block.dimension);
            if (this.hasPerms(e.player, zone)) return;
            if (zone && zone.data.flags.includes("DisallowBlockPlacing")) {
                e.cancel = true;
                e.player.error(this.msg);
            }
        });
        world.beforeEvents.playerBreakBlock.subscribe((e) => {
            let zone = this.getZoneAtVec3(e.block.location, e.block.dimension);
            if (this.hasPerms(e.player, zone)) return;
            if (zone && zone.data.flags.includes("DisallowBlockBreaking")) {
                e.cancel = true;
                e.player.error(this.msg);
            }
        });
        world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
            let zone = this.getZoneAtVec3(e.block.location, e.block.dimension);
            if (this.hasPerms(e.player, zone)) return;
            if (zone) {
                if (zone.data.flags.includes("DisallowAllBlockInteractions")) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.msg);
                    return;
                }
                if (
                    zone.data.flags.includes("DisableDoorInteractions") &&
                    (e.block.typeId.includes(":door_") ||
                        e.block.typeId.includes("_door"))
                ) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.msg);
                    return;
                }
                if (
                    zone.data.flags.includes("DisallowTrapdoorInteractions") &&
                    (e.block.typeId.includes(":trapdoor_") ||
                        e.block.typeId.includes("_trapdoor") ||
                        e.block.typeId == "minecraft:trapdoor")
                ) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.msg);

                    return;
                }
                if (
                    zone.data.flags.includes("DisableChestInteractions") &&
                    ["minecraft:chest", "minecraft:barrel"].includes(
                        e.block.typeId
                    )
                ) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.msg);

                    return;
                }
                if (
                    zone.data.flags.includes("DisallowLogStripping") &&
                    e.block.typeId.includes("log") &&
                    e.itemStack &&
                    e.itemStack.typeId.includes("axe")
                ) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.msg);

                    return;
                }
                if (
                    zone.data.flags.includes("DisallowLeverInteractions") &&
                    e.block.typeId == "minecraft:lever"
                ) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.msg);
                    return;
                }
                if(zone.data.flags.includes("DisallowCustomInteractions") && Array.isArray(zone.data.customInteractionList) && includesAdv(zone.data.customInteractionList, e.block.typeId)) {
                    e.cancel =true;
                    if (e.isFirstEvent) e.player.error(this.msg);
                    return;
                }
            }
        });
        // system.runInterval(() => {
            // let entities = world.getDimension("overworld").getEntities({excludeTypes:["minecraft:player"]})
            // for(const entity of entities) {
            //     entity.remove();
            // }
        // });
        world.afterEvents.entitySpawn.subscribe((e) => {
            if(!e.entity.isValid) return;
            let zone = this.getZoneAtVec3(e.entity.location, e.entity.dimension);
            if(!zone) return;
            if(zone.data.entityWhitelist && Array.isArray(zone.data.entityWhitelist) && zone.data.entityWhitelist.length && includesAdv(zone.data.entityWhitelist, e.entity.typeId)) return;
            if(e.entity.typeId == "minecraft:player" || e.entity.typeId.startsWith('leaf:') || e.entity.typeId == 'minecraft:item' || zone.data.type == "CLAIM") return;

            if(zone && zone.data.type == "CLAIM") return; // disable this flag in claims :>
            if (zone && zone.data.flags.includes("DisallowMobSpawning")) {
                e.entity.remove();
            }
        });
    }
    hasPerms(player, zone) {
        if (zone && zone.data.type == "CLAIM") {
            // return false;
            let id = "";
            try {
                id = playerStorage.getID(player);
            } catch {}
            return (
                playerStorage.getID(player) == zone.data.owner ||
                (id &&
                    zone.data.allowedPlayers &&
                    zone.data.allowedPlayers.includes(id)) ||
                prismarineDb.permissions.hasPermission(player, "claim.bypass")
            );
        }
        return prismarineDb.permissions.hasPermission(player, "zone.bypass");
    }
    getZoneAtVec3(vec3, dimension) {
        let zones = [
            ...this.getZones(),
            ...landclaims.db.findDocuments({ type: "CLAIM" }),
        ].sort((a, b) => b.data.priority - a.data.priority);
        let px = Math.floor(vec3.x);
        let py = Math.floor(vec3.y);
        let pz = Math.floor(vec3.z);
        for (const zone of zones) {
            try {
                if(dimension && dimension.id != (world.getDimension(zone.data.dimension && typeof zone.data.dimension == "string" ? zone.data.dimension : "minecraft:overworld").id)) continue;
                if(zone.data.isRef) continue;
                if(zone.data.disabled) continue;
            } catch {}
            if (zone.data.type == 14) {
                let { x1, y1, z1, x2, y2, z2 } = zone.data;
                if (isPointInCube(px, py, pz, x1, y1, z1, x2, y2, z2)) {
                    return {...zone, data: {...zone.data, type: "ZONE"}};
                }
            } else if (zone.data.type == "CLAIM") {
                let x1 = zone.data.pos1.x;
                let x2 = zone.data.pos2.x;
                let y1 = zone.data.pos1.y;
                let y2 = zone.data.pos2.y;
                let z1 = zone.data.pos1.z;
                let z2 = zone.data.pos2.z;
                if (isPointInCube(px, py, pz, x1, y1, z1, x2, y2, z2)) {
                    return zone;
                }
            }
        }
    }
    getZoneAtVec3ExcludeLandClaims(vec3, dimension) {
        let zones = [...this.getZones()].sort(
            (a, b) => b.data.priority - a.data.priority
        );
        let px = Math.floor(vec3.x);
        let py = Math.floor(vec3.y);
        let pz = Math.floor(vec3.z);
        for (const zone of zones) {
            if(dimension && dimension.id != (world.getDimension(zone.data.dimension && typeof zone.data.dimension == "string" ? zone.data.dimension : "minecraft:overworld").id)) continue;
            if (zone.data.type == 14) {
                let { x1, y1, z1, x2, y2, z2 } = zone.data;
                if (isPointInCube(px, py, pz, x1, y1, z1, x2, y2, z2)) {
                    return {...zone, data: {...zone.data, type: "ZONE"}};
                }
            } else if (zone.data.type == "CLAIM") {
                let x1 = zone.data.pos1.x;
                let x2 = zone.data.pos2.x;
                let y1 = zone.data.pos1.y;
                let y2 = zone.data.pos2.y;
                let z1 = zone.data.pos1.z;
                let z2 = zone.data.pos2.z;
                if (isPointInCube(px, py, pz, x1, y1, z1, x2, y2, z2)) {
                    return zone;
                }
            }
        }
    }
    getZones(all = false) {
        return uiBuilder.db.findDocuments({ type: 14 }).sort((a,b)=>{
            return b.data.priority - a.data.priority;
        })
    }
    zoneDataToVolume(zone) {
        return {
            start: {x: zone.data.x1, y: zone.data.y1, z: zone.data.z1},
            end: {x: zone.data.x2, y: zone.data.y2, z: zone.data.z2},
        }
    }
    addZone(name, x1, y1, z1, x2, y2, z2, priority = 1, flags = [], dimension) {
        if (uiBuilder.db.findFirst({ type: 14, name })) return false;
        uiBuilder.db.insertDocument({
            name,
            type: 14,
            dimension: dimension ? dimension.id : world.getDimension('overworld').id,
            x1,
            y1,
            z1,
            x2,
            y2,
            z2,
            priority,
            flags,
        });
        return true;
    }

    editEntityWhitelist(name, whitelist) {
        let doc = uiBuilder.db.findFirst({ type: 14, name });
        if (!doc) return;
        doc.data.entityWhitelist = whitelist;
        uiBuilder.db.overwriteDataByID(doc.id, doc.data);
    }
    editInteractWhitelist(name, whitelist) {
        let doc = uiBuilder.db.findFirst({ type: 14, name });
        if (!doc) return;
        doc.data.customInteractionList = whitelist;
        uiBuilder.db.overwriteDataByID(doc.id, doc.data);
    }

    editFlags(name, flags = []) {
        let doc = uiBuilder.db.findFirst({ type: 14, name });
        if (!doc) return;
        doc.data.flags = flags;
        uiBuilder.db.overwriteDataByID(doc.id, doc.data);
    }
    disableZone(name) {
        let doc = uiBuilder.db.findFirst({type: 14, name})
        if(doc) {
            doc.data.disabled = true;
            uiBuilder.db.overwriteDataByID(doc.id, doc.data)
            return true;
        }
        return false;
    }
    enableZone(name) {
        let doc = uiBuilder.db.findFirst({type: 14, name})
        if(doc) {
            doc.data.disabled = false;
            uiBuilder.db.overwriteDataByID(doc.id, doc.data)
            return true;
        }
        return false;
    }
    removeZone(name) {
        let doc = uiBuilder.db.findFirst({type: 14, name})
        if(doc) {
            uiBuilder.db.deleteDocumentByID(doc.id)
            return true;
        } else {
            return false;
        }
    }
}

export function isInside2D(x, z, corner1, corner2) {
    const minX = Math.min(corner1.x, corner2.x);
    const maxX = Math.max(corner1.x, corner2.x);
    const minZ = Math.min(corner1.z, corner2.z);
    const maxZ = Math.max(corner1.z, corner2.z);
  
    return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
  }
  

export default new Zones();
