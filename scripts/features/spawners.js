import { EntityTypes, ItemStack, system, world } from "@minecraft/server";

system.run(()=>{
    let lootTableManager = world.getLootTableManager()
    // world.
    let items = lootTableManager.generateLootFromEntityType(EntityTypes.get("minecraft:zombie"), new ItemStack("minecraft:diamond_sword", 1))

    if(items) {
        for(const item of items) world.getDimension('overworld').spawnItem(item, {x: -31, y: 88, z: -31})
    }
})