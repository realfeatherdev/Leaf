import { HudElement, HudVisibility, system, world } from "@minecraft/server";
import blockDb from "../blockDb";
import config from "../versionData";
import { ModalForm } from "../lib/form_func";
import uiManager from "../uiManager";
import actionParser from "../api/actionParser";
import { prismarineDb } from "../lib/prismarinedb";
import zones, { isInCuboid } from "../api/zones";
let inUI = new Map();
uiManager.addUI(config.uiNames.BlockEditor, "Block editor", (player, vec3) => {
    let modalForm = new ModalForm();
    let blockData = blockDb.getBlockData(vec3);
    let defaultVal = undefined;
    if (blockData && blockData.action) {
        defaultVal = blockData.action;
    }
    modalForm.textField(
        "On Interaction Action",
        "Example: /say hi",
        defaultVal
    );
    modalForm.submitButton("Edit");
    modalForm
        .show(player, false, (player, response) => {
            blockDb.setBlockData(vec3, { action: response.formValues[0] });
        })
        .then((res) => {
            inUI.delete(player.id);
        });
});
function spawnParticle(player, particle, loc) {
    try {
        player.spawnParticle(particle, loc)
    } catch {}
}
let usingBlockEditor = new Map();
let iter = 0;
function pointWithinDistanceOfCuboid(p, pos1, pos2, maxDist) {
  const min = {
    x: Math.min(pos1.x, pos2.x),
    y: Math.min(pos1.y, pos2.y),
    z: Math.min(pos1.z, pos2.z),
  };
  const max = {
    x: Math.max(pos1.x, pos2.x),
    y: Math.max(pos1.y, pos2.y),
    z: Math.max(pos1.z, pos2.z),
  };

  const cx = Math.max(min.x, Math.min(p.x, max.x));
  const cy = Math.max(min.y, Math.min(p.y, max.y));
  const cz = Math.max(min.z, Math.min(p.z, max.z));

  const dx = p.x - cx;
  const dy = p.y - cy;
  const dz = p.z - cz;

  return (dx*dx + dy*dy + dz*dz) <= maxDist * maxDist;
}
system.runInterval(() => {
    iter += 5;
    if(iter >= 20) iter = 0;
    for (const player of world.getPlayers()) {
        if (player.hasTag("chunk-borders") && iter % 20 == 0) {
            let chunkX = Math.floor(player.location.x / 16) * 16;
            let chunkZ = Math.floor(player.location.z / 16) * 16;
            chunkX += 16;
            chunkZ += 16;
            player.spawnParticle("leaf:chunkborder", {x: chunkX, y: player.dimension.heightRange.min + 192, z: chunkZ - 8})
            player.spawnParticle("leaf:chunkborder", {x: chunkX - 16, y: player.dimension.heightRange.min + 192, z: chunkZ - 8})
            player.spawnParticle("leaf:chunkborder_ew", {x: chunkX - 8, y: player.dimension.heightRange.min + 192, z: chunkZ})
            player.spawnParticle("leaf:chunkborder_ew", {x: chunkX - 8, y: player.dimension.heightRange.min + 192, z: chunkZ - 16})
            // player.spawnParticle("leaf:chunkborder", {x: chunkX + 16, y: player.dimension.heightRange.min, z: chunkZ + 8})

        }
        if(player.hasTag("zone-borders") && iter % 20 == 0) {
            let zones2 = zones.getZones()
            let foundActive = false;
            for(const zone of zones2) {
                let dim = zone.data.dimension && typeof zone.data.dimension === "string" ? zone.data.dimension : "minecraft:overworld";
                if(player.dimension.id != (dim.split(':').length > 1 ? dim : `minecraft:${dim}`)) continue;
                let x1 = Math.min(zone.data.x1, zone.data.x2)
                let y1 = Math.min(zone.data.y1, zone.data.y2)
                let z1 = Math.min(zone.data.z1, zone.data.z2)
                let x2 = Math.max(zone.data.x1, zone.data.x2) + 1
                let y2 = Math.max(zone.data.y1, zone.data.y2) + 1
                let z2 = Math.max(zone.data.z1, zone.data.z2) + 1
                let pos1 = {x: x1, y: y1, z: z1}
                let pos2 = {x: x2 - 1, y: y2 - 1, z: z2 - 1}
                if(!pointWithinDistanceOfCuboid(player.location, pos1, pos2, 67)) continue;
                // world.sendMessage(JSON.stringify(pos1))
                // world.sendMessage(JSON.stringify(pos2))
                let isInZone = isInCuboid(player.location, pos1, pos2)
                let p = `${zone.data.disabled ? "leaf:border_disabled" : zone.data.isRef ? "leaf:border_ref" : "leaf:border"}${isInZone && !foundActive ? "_active" : ""}`
                if(isInZone && !foundActive) foundActive = true;
                for(let i = z1;i < z2 + 1;i++) {
                    spawnParticle(player, p, {x: x1, y: y1, z: i})
                    spawnParticle(player, p, {x: x1, y: y2, z: i})
                    spawnParticle(player, p, {x: x2, y: y1, z: i})
                    spawnParticle(player, p, {x: x2, y: y2, z: i})
                }
                for(let i = y1;i < y2 + 1;i++) {
                    if(i == y1 || i == y2) continue;
                    spawnParticle(player, p, {x: x1, y: i, z: z2})
                    spawnParticle(player, p, {x: x2, y: i, z: z1})
                    spawnParticle(player, p, {x: x1, y: i, z: z1})
                    spawnParticle(player, p, {x: x2, y: i, z: z2})
                }
                for(let i = x1;i < x2 + 1;i++) {
                    if(i == x1 || i == x2) continue;
                    spawnParticle(player, p, {x: i, y: y1, z: z1})
                    spawnParticle(player, p, {x: i, y: y2, z: z1})
                    spawnParticle(player, p, {x: i, y: y1, z: z2})
                    spawnParticle(player, p, {x: i, y: y2, z: z2})
                }
            }
        }
        continue;
        let inventory = player.getComponent("inventory");
        let item = inventory.container.getItem(player.selectedSlotIndex);
        if (item && item.typeId == "leaf:block_editor") {
            usingBlockEditor.set(player.id, true);
            player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [
                HudElement.AirBubbles,
                HudElement.ItemText,
                HudElement.Hunger,
                HudElement.PaperDoll,
                HudElement.StatusEffects,
                HudElement.Armor,
                HudElement.Health,
            ]);
            player.addTag("chunk-borders");
            let blocks = blockDb.getBlocks();
            let entities = player.dimension.getEntities({
                location: player.location,
                closest: 32,
            });
            if (entities && entities.length) {
                for (const entity of entities) {
                    if (entity.id == player.id) continue;
                    // world.sendMessage("a")
                    if (entity.getDynamicProperty("interact")) {
                        try {
                            // // // console.warn("a")
                            let location = entity.location;
                            let block = {
                                x: location.x,
                                y: location.y,
                                z: location.z,
                            };
                            // world.sendMessage(JSON.stringify(block))
                            player.spawnParticle(`leaf:border`, block);
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                y: block.y + 1,
                            });
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                z: block.z + 1,
                            });
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                z: block.z + 1,
                                y: block.y + 1,
                            });
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                x: block.x + 1,
                            });
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                x: block.x + 1,
                                y: block.y + 1,
                            });
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                x: block.x + 1,
                                z: block.z + 1,
                            });
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                x: block.x + 1,
                                z: block.z + 1,
                                y: block.y + 1,
                            });
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                x: block.x + 1,
                                z: block.z + 1,
                                y: block.y + 1,
                            });
                            player.spawnParticle(`leaf:border`, {
                                ...block,
                                x: block.x + 1,
                                z: block.z + 1,
                                y: block.y + 1,
                            });
                        } catch {}
                    }
                }
            }
            for (const block of blocks) {
                let blockData = blockDb.getBlockData(block);
                if (!blockData.action) continue;
                try {
                    player.spawnParticle(`leaf:border`, block);
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        y: block.y + 1,
                    });
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        z: block.z + 1,
                    });
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        z: block.z + 1,
                        y: block.y + 1,
                    });
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        x: block.x + 1,
                    });
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        x: block.x + 1,
                        y: block.y + 1,
                    });
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        x: block.x + 1,
                        z: block.z + 1,
                    });
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        x: block.x + 1,
                        z: block.z + 1,
                        y: block.y + 1,
                    });
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        x: block.x + 1,
                        z: block.z + 1,
                        y: block.y + 1,
                    });
                    player.spawnParticle(`leaf:border`, {
                        ...block,
                        x: block.x + 1,
                        z: block.z + 1,
                        y: block.y + 1,
                    });
                } catch {}
            }
            let blockFromView = player.getBlockFromViewDirection({
                maxDistance: 6,
            });
            if (blockFromView && blockFromView.block) {
                let blockData = blockDb.getBlockData(
                    blockFromView.block.location
                );
                if (blockData && blockData.action) {
                    player.onScreenDisplay.setActionBar(
                        `${blockData.action}\nSneak and use the item to open chunk property editor\nUse this on an entity to open entity property editor`
                    );
                } else {
                    player.onScreenDisplay.setActionBar(
                        "No Action\nSneak and use the item to open chunk property editor\nUse this on an entity to open entity property editor"
                    );
                }
            } else {
                player.onScreenDisplay.setActionBar(
                    "Sneak and use the item to open chunk property editor\nUse this on an entity to open entity property editor"
                );
            }
        } else if (usingBlockEditor.has(player.id)) {
            player.removeTag("chunk-borders");
            usingBlockEditor.delete(player.id);
            player.onScreenDisplay.setActionBar("");
            player.onScreenDisplay.setHudVisibility(HudVisibility.Reset, [
                HudElement.AirBubbles,
                HudElement.ItemText,
                HudElement.Hunger,
                HudElement.PaperDoll,
                HudElement.StatusEffects,
                HudElement.Armor,
                HudElement.Health,
            ]);
        }
    }
}, 5);
world.beforeEvents.itemUse.subscribe((e) => {
    if (
        e.itemStack.typeId == "leaf:wblock_editor" &&
        e.source &&
        e.source.typeId == "minecraft:player" &&
        e.source.isSneaking
    ) {
        world.sendMessage("Opening chunk editor!");
        return;
    }

    if (e.itemStack.typeId == "leaf:block_editor" && e.source) {
        let block = e.source.getBlockFromViewDirection({
            maxDistance: 6,
        });
        let entity = e.source.getEntitiesFromViewDirection({
            maxDistance: 6,
        });
        if (!block && !entity.length)
            e.source.error(
                "Please use this on a block or entity, or sneak and use the item to open chunk property editor"
            );
    }
});
world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
    if (
        e.itemStack &&
        e.itemStack.typeId == "leaf:block_editor" &&
        prismarineDb.permissions.hasPermission(e.player, "blockeditor.open") &&
        !e.player.isSneaking
    ) {
        e.cancel = true;
        system.run(() => {
            uiManager.open(e.player, config.uiNames.EntityEditor, e.target);
        });
    }
});
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
    if (!e.isFirstEvent) return;
    if (
        e.itemStack &&
        e.itemStack.typeId == "leaf:block_editor" &&
        !inUI.has(e.player.id) &&
        prismarineDb.permissions.hasPermission(e.player, "blockeditor.open")
    ) {
        e.cancel = true;
        if (e.player.isSneaking) return;
        inUI.set(e.player.id, true);
        system.run(() => {
            uiManager.open(
                e.player,
                config.uiNames.BlockEditor,
                e.block.location
            );
        });
        return;
    }
    if (e.itemStack && e.itemStack.typeId == "leaf:block_editor") return;
    let blockData = blockDb.getBlockData(e.block.location);
    let defaultVal = undefined;
    if (blockData && blockData.action) {
        defaultVal = blockData.action;
    }
    if (defaultVal) {
        e.cancel = true;
        system.run(() => {
            actionParser.runAction(e.player, defaultVal);
        });
    }
});
