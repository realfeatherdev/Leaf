import { Player, system, world } from "@minecraft/server";
import configAPI from "../api/config/configAPI";

let ignoredTypes = ["minecraft:player", "minecraft:npc", "minecraft:wolf", "minecraft:cat", "minecraft:armor_stand", "minecraft:item", "leaf:floating_text"]

configAPI.registerProperty("MobStacking", configAPI.Types.Boolean, false)

world.afterEvents.entitySpawn.subscribe(e=>{
    if(!configAPI.getProperty("MobStacking")) return;
    if(!ignoredTypes.includes(e.entity.typeId) && e.entity.typeId.startsWith('minecraft:')) {
        if(e.entity.getDynamicProperty('stack') >= 0) {
            return;
        }
        e.entity.setDynamicProperty("stack", 0)
    }
})

function closestSameMods(entity, location) {
    if(!configAPI.getProperty("MobStacking")) return;
    if(entity instanceof Player) return null;
    const typeId = entity.typeId;
    const options = {
        type: typeId,
        location,
        maxDistance: 3,
        minDistance: 0.5
    }
    return entity.dimension.getEntities(options)
}

function stackEntities(entity, entitiesAround) {
    if(!configAPI.getProperty("MobStacking")) return;
    let entityStack = entity.getDynamicProperty("stack");
    if(entityStack > 0) {
        entity.nameTag = `${entity.typeId.split(':')[1].split('_').map(_=>`${_[0].toUpperCase()}${_.substring(1).toLowerCase()}`).join(' ')}`
    }
    if(entitiesAround[0].getDynamicProperty("stack") <= entityStack) {
        if(entitiesAround[0].getDynamicProperty("stack") == 0) {
            entity.setDynamicProperty("stack", entityStack + 1)
            entitiesAround[0].remove();
            entity.nameTag = `§a${entity.typeId.split(':')[1].split('_').map(_=>`${_[0].toUpperCase()}${_.substring(1).toLowerCase()}`).join(' ')} §ex${entityStack ? entityStack : 0}`
            return;
        }
        if(entitiesAround[0].getDynamicProperty("stack") >= 1) {
            entity.setDynamicProperty("stack", entityStack + entitiesAround[0].getDynamicProperty("stack"))
            entitiesAround[0].remove();
            entity.nameTag = `§a${entity.typeId.split(':')[1].split('_').map(_=>`${_[0].toUpperCase()}${_.substring(1).toLowerCase()}`).join(' ')} §ex${entityStack ? entityStack : 0}`
            return;
        }
    }
}

system.runInterval(()=>{
    if(!configAPI.getProperty("MobStacking")) return;
    const overworldEntities = world.getDimension('overworld').getEntities();
    overworldEntities.forEach(entity =>{
        if(!entity.isValid) return;
        if(ignoredTypes.includes(entity.typeId) || !entity.typeId.startsWith('minecraft:')) return;
        const closestEntities = closestSameMods(entity, entity.location);
        entity.nameTag = `§a${entity.typeId.split(':')[1].split('_').map(_=>`${_[0].toUpperCase()}${_.substring(1).toLowerCase()}`).join(' ')} §ex${entity.getDynamicProperty('stack') ? entity.getDynamicProperty('stack') : 0}`
        if(closestEntities.length > 0) {
            stackEntities(entity, closestEntities)
            entity.dimension.runCommand('kill @e[r=100,x=0,y=-10000,z=0]')
        }
    })
}, 5)
world.afterEvents.entityDie.subscribe(e=>{
    if(!configAPI.getProperty("MobStacking")) return;
    const {deadEntity: entity} = e;
    const player = e.damageSource.damagingEntity;
    if(!entity.isValid) return;
    if(e.damageSource == 'suicide') return;
    if(entity.getDynamicProperty('stack') >= 1) {
        let newEntity = entity.dimension.spawnEntity(entity.typeId, entity.location)
        newEntity.setDynamicProperty('stack', entity.getDynamicProperty('stack') - 1)
    }
})
// world.sendMessage("mob stacking")