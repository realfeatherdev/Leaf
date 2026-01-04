import { system, world } from "@minecraft/server";
import { dynamicToast } from "../lib/chatNotifs";
import configAPI from "../api/config/configAPI";
import uiManager from "../uiManager";
import versionData from "../versionData";
import { ModalForm } from "../lib/form_func";
configAPI.registerProperty("WorldBorder", configAPI.Types.Boolean, false);
configAPI.registerProperty("WorldBorderSize", configAPI.Types.Number, 10000);
configAPI.registerProperty("WorldBorderSubtext", configAPI.Types.String, "You cant go here")
configAPI.registerProperty("WorldBorderTitle", configAPI.Types.String, "Error")
configAPI.registerProperty("WorldBorderSound", configAPI.Types.String, "random.glass")
configAPI.registerProperty("WorldBorderDamage", configAPI.Types.Number, 1)
configAPI.registerProperty("WorldBorderKnockbackCooldown", configAPI.Types.Number, 4)
configAPI.registerProperty("WorldBorderDamageThreshold", configAPI.Types.Number, 10)
configAPI.registerProperty("WorldBorderTpFallbackThreshold", configAPI.Types.Number, 25)
configAPI.registerProperty("WorldBorderKnockbackVerticalIntensity", configAPI.Types.Number, 1)
configAPI.registerProperty("WorldBorderKnockbackHorizontalIntensity", configAPI.Types.Number, 3)
configAPI.registerProperty("WorldBorderParticle1", configAPI.Types.String, "leaf:worldborder")
configAPI.registerProperty("WorldBorderParticle2", configAPI.Types.String, "leaf:worldborder_ew")
configAPI.registerProperty("WorldBorderParticleViewingDistance", configAPI.Types.Number, 200)
configAPI.registerProperty("WorldBorderParticles", configAPI.Types.Boolean, true)
function nan0(string, def = 0) {
    let num = parseInt(string);
    if(isNaN(num)) return def;
    return num;
}
function nan1(string, def = 0) {
    let num = parseFloat(string);
    if(isNaN(num)) return def;
    return num;
}
uiManager.addUI(versionData.uiNames.Worldborder, "", (player)=>{
    let modal = new ModalForm();
    modal.title("Worldborder")
    modal.toggle("Enable worldborder", configAPI.getProperty("WorldBorder"))
    modal.toggle("Enable worldborder particles", configAPI.getProperty("WorldBorderParticles"))
    modal.textField("Worldborder size", "10000", configAPI.getProperty("WorldBorderSize").toString())
    modal.textField("Worldborder sound", "random.glass", configAPI.getProperty("WorldBorderSound"))
    modal.textField("Worldborder toast title", "Error", configAPI.getProperty("WorldBorderTitle"))
    modal.textField("Worldborder toast subtext", "You cant go here", configAPI.getProperty("WorldBorderSubtext"))
    modal.textField("Worldborder TP fallback threshold", "25", configAPI.getProperty("WorldBorderTpFallbackThreshold").toString())
    modal.textField("Worldborder damage threshold", "10", configAPI.getProperty("WorldBorderDamageThreshold").toString())
    modal.textField("Worldborder knockback cooldown", "1", configAPI.getProperty("WorldBorderKnockbackCooldown").toString())
    modal.textField("Worldborder knockback vertical intensity", "1", configAPI.getProperty("WorldBorderKnockbackVerticalIntensity").toString())
    modal.textField("Worldborder knockback horizontal intensity", "3", configAPI.getProperty("WorldBorderKnockbackHorizontalIntensity").toString())
    modal.textField("Worldborder particle viewing distance", "200", configAPI.getProperty("WorldBorderParticleViewingDistance").toString())
    modal.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, versionData.uiNames.Config.Misc)
        configAPI.setProperty("WorldBorder", response.formValues[0])
        configAPI.setProperty("WorldBorderParticles", response.formValues[1])
        configAPI.setProperty("WorldBorderSize", nan0(response.formValues[2]))
        configAPI.setProperty("WorldBorderSound", response.formValues[3])
        configAPI.setProperty("WorldBorderTitle", response.formValues[4])
        configAPI.setProperty("WorldBorderSubtext", response.formValues[5])
        configAPI.setProperty("WorldBorderTpFallbackThreshold", nan0(response.formValues[6]))
        configAPI.setProperty("WorldBorderDamageThreshold", nan0(response.formValues[7]))
        configAPI.setProperty("WorldBorderKnockbackCooldown", nan0(response.formValues[8]))
        configAPI.setProperty("WorldBorderKnockbackVerticalIntensity", nan1(response.formValues[9]))
        configAPI.setProperty("WorldBorderKnockbackHorizontalIntensity", nan1(response.formValues[10]))
        configAPI.setProperty("WorldBorderParticleViewingDistance", nan0(response.formValues[11]))
        return uiManager.open(player, versionData.uiNames.Config.Misc)
    })
})
function spawnParticle(player, particle, loc, size) {
    if(loc.x > size || loc.x < -size || loc.z > size || loc.z < -size) return;
    try {
        player.spawnParticle(particle, loc)
    } catch {

    }
}
const STEP = 16;
const RADIUS = STEP * 7;
const OFFSET = 8;
function spawnLine(player, particle, axis, fixedValue, centerValue) {
    for (let i = -RADIUS; i <= RADIUS; i += STEP) {
        if (axis === "x") {
            spawnParticle(player, particle, {
                x: fixedValue,
                y: 0,
                z: centerValue + i - OFFSET
            }, configAPI.getProperty("WorldBorderSize"));
        } else {
            spawnParticle(player, particle, {
                x: centerValue + i - OFFSET,
                y: 0,
                z: fixedValue
            }, configAPI.getProperty("WorldBorderSize"));
        }
    }
}

system.runInterval(()=>{
    if(!configAPI.getProperty("WorldBorder") || !configAPI.getProperty("WorldBorderParticles")) return;
    let particle1 = configAPI.getProperty("WorldBorderParticle1")
    let particle2 = configAPI.getProperty("WorldBorderParticle2")
    let size = configAPI.getProperty("WorldBorderSize");
    let VIEWING_DISTANCE = configAPI.getProperty("WorldBorderParticleViewingDistance")
    for(const player of world.getPlayers()) {
        let distToNorth = Math.floor(player.location.z + size); // -Z
        let distToSouth = Math.floor(size - player.location.z); // +Z
        let distToEast  = Math.floor(size - player.location.x); // +X
        let distToWest  = Math.floor(player.location.x + size); // -X
        let location = {
            x: Math.floor(player.location.x / 16) * 16,
            z: Math.floor(player.location.z / 16) * 16,
        }
        if (distToNorth <= VIEWING_DISTANCE) {
            spawnLine(player, particle2, "z", -size, location.x);
        }

        if (distToSouth <= VIEWING_DISTANCE) {
            spawnLine(player, particle2, "z", size, location.x);
        }

        if (distToWest <= VIEWING_DISTANCE) {
            spawnLine(player, particle1, "x", -size, location.z);
        }

        if (distToEast <= VIEWING_DISTANCE) {
            spawnLine(player, particle1, "x", size, location.z);
        }
    }
}, (20 * 3))
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
