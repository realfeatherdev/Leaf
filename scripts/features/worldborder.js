import { system, world } from "@minecraft/server";
import { dynamicToast } from "../lib/chatNotifs";
import configAPI from "../api/config/configAPI";
configAPI.registerProperty("WorldBorder", configAPI.Types.Boolean, false);
configAPI.registerProperty("WorldBorderSize", configAPI.Types.Number, 10000);
configAPI.registerProperty("WorldBorderSubtext", configAPI.Types.String, "You cant go here")
configAPI.registerProperty("WorldBorderTitle", configAPI.Types.String, "Error")
configAPI.registerProperty("WorldBorderSound", configAPI.Types.String, "random.glass")
configAPI.registerProperty("WorldBorderDamage", configAPI.Types.Number, 1)
configAPI.registerProperty("WorldBorderKnockbackCooldown", configAPI.Types.Number, 4)
configAPI.registerProperty("WorldBorderDamageThreshold", configAPI.Types.Number, 10)
configAPI.registerProperty("WorldBorderTpFallbackThreshold", configAPI.Types.Number, 42)
configAPI.registerProperty("WorldBorderKnockbackVerticalIntensity", configAPI.Types.Number, 1)
configAPI.registerProperty("WorldBorderKnockbackHorizontalIntensity", configAPI.Types.Number, 1)
let playerLocs = {};
function getWorldBorderSize() {
    return configAPI.getProperty("WorldBorderSize");
}
let playerCooldown = {};
let tick = 0;
let threshold = 70;
let threshold2 = 10;
let clamp = (min, val, max) => (val > max ? max : val < min ? min : val);
system.runInterval(() => {
    if (!configAPI.getProperty("WorldBorder")) return;
    tick++;
    let size = getWorldBorderSize();
    for (const player of world.getPlayers()) {
        let newLoc = {
            x: clamp(-size, player.location.x, size),
            y: player.location.y,
            z: clamp(-size, player.location.z, size),
        };
        if (newLoc.x != player.location.x || newLoc.z != player.location.z) {
            // player.teleport(newLoc)
            if (
                playerCooldown[player.id] &&
                tick >= playerCooldown[player.id]
            ) {
                player.sendMessage(
                    dynamicToast("", `§l§c${configAPI.getProperty("WorldBorderTitle")}\n§r§7${configAPI.getProperty("WorldBorderSubtext")}`)
                );
                player.playSound(configAPI.getProperty("WorldBorderSound"));
                let tp = false;
                let threshold = configAPI.getProperty("WorldBorderTpFallbackThreshold")
                let threshold2 = configAPI.getProperty("WorldBorderDamageThreshold")
                if (
                    player.location.x >= size + threshold2 ||
                    player.location.x < -size - threshold2 ||
                    player.location.z >= size + threshold2 ||
                    player.location.z < -size - threshold2
                ) {
                    player.applyDamage(configAPI.getProperty("WorldBorderDamage"));
                }
                if (
                    player.location.x >= size + threshold ||
                    player.location.x < -size - threshold ||
                    player.location.z >= size + threshold ||
                    player.location.z < -size - threshold
                )
                    tp = true;
                if (tp) {
                    player.teleport(newLoc);
                } else {
                    const dx = -player.location.x;
                    const dz = -player.location.z;
                    const length = Math.sqrt(dx * dx + dz * dz);
                    
                    // Prevent divide by zero just in case
                    const knockback = length === 0
                        ? { x: 0, z: 0 }
                        : { x: (dx / length) * configAPI.getProperty("WorldBorderKnockbackHorizontalIntensity"), z: (dz / length) * configAPI.getProperty("WorldBorderKnockbackHorizontalIntensity") };
                    
                    player.applyKnockback(knockback, configAPI.getProperty("WorldBorderKnockbackVerticalIntensity"));
                    
                }
                playerCooldown[player.id] = tick + configAPI.getProperty("WorldBorderKnockbackCooldown");
            } else if (!playerCooldown[player.id]) {
                playerCooldown[player.id] = tick + configAPI.getProperty("WorldBorderKnockbackCooldown");
            }
        }
    }
}, 5);
