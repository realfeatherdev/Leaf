import { world } from "@minecraft/server";
import configAPI from "../api/config/configAPI";

configAPI.registerProperty("HiveKB", configAPI.Types.Boolean, false)

world.afterEvents.entityHurt.subscribe((data) => {
    if(!configAPI.getProperty("HiveKB")) return;
    const player = data.hurtEntity;
    const target = data.damageSource.damagingEntity;

    if (!target || target.typeId !== "minecraft:player") return;

    const direction = target.getViewDirection();
    player.applyKnockback({x: direction.x * 0.7, z: direction.z * 0.7}, 0.45);
});