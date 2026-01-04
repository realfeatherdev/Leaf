import "./action/index.js";
import "./script/index.js";
import "./invites/index.js";
import "./command/index.js";
import "./function/index.js";
import uiBuilder from "../../../api/uiBuilder.js";
import { ModalForm } from "../../../lib/form_func.js";
import { BlockComponentTypes, Dimension, StructureAnimationMode, StructureRotation, system, world } from "@minecraft/server";
import uiManager from "../../../uiManager.js";
import versionData from "../../../versionData.js";
import { isInCuboid } from "../../../api/zones.js";
import configAPI from "../../../api/config/configAPI.js";
function yes(str) {
    return `${str.split(":").length == 1 ? "mystructure:" : ""}${str}`
}
function nan0(str) {
    let num = parseInt(str);
    if (isNaN(num)) return 0;
    return num;
}

// function spawnIsland(data, num) {
//     let {structure, spacingX, spacingZ, baseX, baseY, baseZ, maxOnX, offX, offY, offZ} = data;
//     let structureData = world.structureManager.get(structure)
//     if(!structureData) return;
//     let x = baseX;
//     let z = baseZ;
//     let y = baseY;
//     let num2 = num;
//     let xIter = 0;
//     let zIter = 0;
//     while(num2 > 0) {
//         x += structureData.size.x + spacingX;
//         xIter++;
//         if(xIter % maxOnX == 0) {
//             zIter++;
//             z += structureData.size.z + spacingZ;
//             x = baseX;
//         }
//         num2--;
//     }
//     world.structureManager.place(structureData.id, world.getDimension('overworld'), {x, y, z}, {
//         // rotation: StructureRotation.
//     })
// }

// function generatePathways(data, count) {
//     let {structure, structureWest, structureCenter, structureWalk, spacingX, spacingZ, baseX, baseY, baseZ, maxOnX, offX, offY, offZ} = data;
//     let structureData = world.structureManager.get(structure)
//     let x = baseX;
//     let z = baseZ;
//     let y = baseY;
//     // let num2 = num;
//     let xIter = 0;
//     let zIter = 0;
//     // count = 2;
//     let maxZ = Math.floor(count / maxOnX)
//     let dim = world.getDimension('overworld');
//     let topPath = count / maxOnX >= maxOnX ? maxOnX - 1 : count - 1;
//     let path = world.structureManager.get(structureWest)
//     let pathCenter = world.structureManager.get(structureCenter)
//     let pathWalk = world.structureManager.get(structureWalk)
//     for(let i =0;i < topPath;i++) {
//         x += structureData.size.x;
//         world.structureManager.place(path.id, dim, {x, y, z}, {
//             rotation: StructureRotation.Rotate270
//         });
//         x += path.size.z;
//     }
//     x = (baseX + ((structureData.size.x * maxOnX) + (topPath * path.size.z))) - path.size.x;
//     let westPath = maxZ;
//     // if(count % maxOnX != 0) westPath--;
//     z = baseZ;
//     for(let i =0;i < westPath;i++) {
//         if(i >= Math.floor(count / maxOnX) - 1) {
//             x -= (spacingX + path.size.x)
//         }
//         z += structureData.size.z;
//         world.structureManager.place(path.id, dim, {x, y, z}, {
//             // rotation: StructureRotation.Rotate270
//         });
//         z += path.size.z;
//     }
//     x = baseX;
//     z = baseZ;
//     let eastPath = Math.floor(count / maxOnX);
//     for(let i = 0;i < eastPath;i++) {

//         z += structureData.size.z;
//         world.structureManager.place(path.id, dim, {x, y, z}, {
//             rotation: StructureRotation.Rotate180
//         });
//         z += path.size.z;
//     }
//     z = baseZ + ((spacingZ * maxOnX) + (structureData.size.z * maxOnX));
//     x = baseX;
//     let northPath = count % maxOnX;
//     if(count % maxOnX == 0) northPath--;
//     for(let i = 0;i < northPath;i++) {
//         if(count % maxOnX != 0 && i == northPath - 1) {
//             z -= spacingZ + structureData.size.z;
//         }
//         x += structureData.size.x;
//         world.structureManager.place(path.id, dim, {x, y, z}, {
//             rotation: StructureRotation.Rotate90
//         });
//         x += path.size.z;
//     }
//     let num2 = count;
//     x = baseX;
//     z = baseZ;
//     let placePathways = true;
//     while(num2 > 0) {
//         if((zIter == maxZ - 1 && xIter == ((count % (maxOnX - 1)) + 1)) || zIter >= maxZ) break;
//         // world.sendMessage(`${(count % (maxOnX - 1))}`)
//         // world.sendMessage(`${xIter}, ${zIter}`)
//         // if() break;
//         world.structureManager.place(pathCenter, dim, {x: x + structureData.size.x,y,z: z + structureData.size.z})
//         let originalZ = z;
//         let originalX = x;
//         x += structureData.size.x + spacingX;
//         xIter++;
//         // if(zIter == Math.floor(count / (maxOnX - 1)) && xIter == northPath - (count % maxOnX == 0 ? 1 : 0)) break;
//         if(xIter % (maxOnX - 1) == 0) {
//             zIter++;
//             z += structureData.size.z + spacingZ;
//             x = baseX;
//             xIter = 0;
//         }
//         num2--;
//         if((zIter == maxZ - 1 && xIter == ((count % (maxOnX - 1)) + 1)) || zIter >= maxZ) {
//             placePathways = false;
//         }
//         if(placePathways) {
//             if(xIter != 0) world.structureManager.place(pathWalk, dim, {x: originalX + structureData.size.x,y,z: originalZ + structureData.size.z + pathCenter.size.z})
//             world.structureManager.place(pathWalk, dim, {x: originalX + structureData.size.x + pathCenter.size.x,y,z: originalZ + structureData.size.z}, {
//                 rotation: StructureRotation.Rotate90
//             })
//         }
//     }

// }

// --- Island utilities -------------------------------------------------

/**
 * Calculate grid position (x, z) of the *n*-th island (0‑based).
 * Returns an object {x, z, col, row}
 */
function islandGridPos(data, index) {
    const { baseX, baseZ, spacingX, spacingZ, maxOnX } = data;
    const island      = world.structureManager.get(data.structure);
    const col         = maxOnX > 0 ? index % maxOnX : 0;
    const row         = maxOnX > 0 ? Math.floor(index / maxOnX) : index;
    const x           = baseX + col * (island.size.x + spacingX);
    const z           = baseZ + row * (island.size.z + spacingZ);
    return { x, z, col, row };
  }
  
  // -----------------------------------------------------------------------------
  //  Public API – spawn a single island by index (0‑based)                      
  // -----------------------------------------------------------------------------
  function spawnIsland(data, index) {
    const { structure, baseY, offX = 0, offY = 0, offZ = 0 } = data;
    const island           = world.structureManager.get(structure);
    if (!island) return;
  
    const pos              = islandGridPos(data, index);
    const dim              = world.getDimension('overworld');
    world.structureManager.place(
      island.id,
      dim,
      {
        x: pos.x,
        y: baseY,
        z: pos.z
      }
    );
  }
  
  function generatePathways(data, count) {
    let {structure, structureWest, structureCenter, structureWalk, spacingX, spacingZ, baseX, baseY, baseZ, maxOnX, offX, offY, offZ} = data;
    let structureData = world.structureManager.get(structure)
    let x = baseX;
    let z = baseZ;
    let y = baseY;
    // let num2 = num;
    let xIter = 0;
    let zIter = 0;
    // count = 2;
    let maxZ = Math.floor(count / maxOnX)
    let dim = world.getDimension('overworld');
    let topPath = count / maxOnX >= maxOnX ? maxOnX - 1 : count - 1;
    let path = world.structureManager.get(structureWest)
    let pathCenter = world.structureManager.get(structureCenter)
    let pathWalk = world.structureManager.get(structureWalk)
    for(let i =0;i < topPath;i++) {
        x += structureData.size.x;
        world.structureManager.place(path.id, dim, {x, y, z}, {
            rotation: StructureRotation.Rotate270
        });
        x += path.size.z;
    }
    x = (baseX + ((structureData.size.x * maxOnX) + (topPath * path.size.z))) - path.size.x;
    let westPath = maxZ;
    if(count % maxOnX == 0) westPath--;
    // if(count % maxOnX != 0) westPath--;
    z = baseZ;
    for(let i =0;i < westPath;i++) {
        if(i >= Math.floor(count / maxOnX) - 1 && count % maxOnX != 0) {
            x -= (spacingX + path.size.x)
        }
        z += structureData.size.z;
        world.structureManager.place(path.id, dim, {x, y, z}, {
            // rotation: StructureRotation.Rotate270
        });
        z += path.size.z;
    }
    x = baseX;
    z = baseZ;
    let eastPath = Math.floor(count / maxOnX);
    if(count % maxOnX == 0) eastPath--;
    for(let i = 0;i < eastPath;i++) {

        z += structureData.size.z;
        world.structureManager.place(path.id, dim, {x, y, z}, {
            rotation: StructureRotation.Rotate180
        });
        z += path.size.z;
    }
    z = baseZ + ((spacingZ * maxOnX) + (structureData.size.z * maxOnX));
    x = baseX;
    let northPath = count % maxOnX;
    z -= spacingZ + structureData.size.z;
    if(count % maxOnX == 0) northPath = maxOnX - 1;
    for(let i = 0;i < northPath;i++) {
        if(count % maxOnX != 0 && i == northPath - 1) {
            z -= spacingZ + structureData.size.z;
        }
        x += structureData.size.x;
        world.structureManager.place(path.id, dim, {x, y, z}, {
            rotation: StructureRotation.Rotate90
        });
        x += path.size.z;
    }
    let num2 = count;
    x = baseX;
    z = baseZ;
    let placePathways = true;
    let cancel = false;
    while(num2 > 0) {
        if(cancel) break;
        // world.sendMessage(${(count % (maxOnX - 1))})
        // world.sendMessage(${xIter}, ${zIter})
        // if() break;
        let newZ = z + structureData.size.z;
        if(newZ > islandGridPos(data, count - 1).z) break;
        world.structureManager.place(pathCenter, dim, {x: x + structureData.size.x,y,z: z + structureData.size.z})
        let originalZ = z;
        let originalX = x;
        x += structureData.size.x + spacingX;
        xIter++;
        // if(zIter == Math.floor(count / (maxOnX - 1)) && xIter == northPath - (count % maxOnX == 0 ? 1 : 0)) break;
        if(xIter % (maxOnX - 1) == 0) {
            zIter++;
            z += structureData.size.z + spacingZ;
            x = baseX;
            xIter = 0;
        }
        num2--;
        if((zIter == maxZ - 1 && xIter == ((count % (maxOnX)) + 1)) || zIter >= maxZ) {
            cancel = true;
            placePathways = false;
        }
        if(placePathways) {
            if(xIter != 0 || zIter < maxZ - 1) world.structureManager.place(pathWalk, dim, {x: originalX + structureData.size.x,y,z: originalZ + structureData.size.z + pathCenter.size.z})
            // if((originalX + structureData.size.x + pathCenter.size.x) > baseX + (structureData.size.x * maxZ) + (spacingX))
            world.structureManager.place(pathWalk, dim, {x: originalX + structureData.size.x + pathCenter.size.x,y,z: originalZ + structureData.size.z}, {
                rotation: StructureRotation.Rotate90
            })
        }
    }

}

function getFacingFromX(xRotation) {
    // Shift -180‒180 → 0‒360
    let rot = (xRotation + 360) % 360;   // ‑180→180  becomes 180→540, then %360 → 0→360

    if (rot < 45 || rot >= 315) return "North";   //   0‒45  & 315‒360
    if (rot < 135)              return "East";    //  45‒135
    if (rot < 225)              return "South";   // 135‒225
    return "West";                                // 225‒315
}
// system.runInterval(()=>{
//     if(!configAPI.getProperty("DevMode")) return;
//     for(const player of world.getPlayers()) {
//         if(!player.hasTag('debug-label')) continue;
//         player.onScreenDisplay.setActionBar([
//             `Rotation Y: ${Math.floor(player.getRotation().y)}°`,
//             `${Math.floor(player.getRotation().y)}° ➜ ${getFacingFromX(player.getRotation().y)}`
//         ].join('\n§r'))
//     }
// })

uiBuilder.definitions.push({
    deftype: "ROOT",
    type: 15,
    extendEditButtons(actionForm, doc) {
        if (doc.data.type != 15) return;
        actionForm.button(`test3`, null, (player)=>{
            generatePathways(doc.data, doc.data.maxOnX * 12)
        })
        actionForm.button(`test2`, null, (player)=>{
            for(let i = 0;i < doc.data.maxOnX * 12;i++) {
                spawnIsland(doc.data, i)
            }
        })
        actionForm.button(
            `§eChange structure\n§r§7${
                doc.data.structure
                    ? world.structureManager.get(doc.data.structure)
                        ? "§aCorrectly set up!"
                        : "§eInvalid Structure ID"
                    : "§cNo Structure"
            }`,
            null,
            (player) => {
                let modalForm = new ModalForm();
                modalForm.title("Edit structure");
                modalForm.textField(
                    "Structure ID",
                    "yes",
                    doc.data.structure ? doc.data.structure : ""
                );
                modalForm.textField(
                    "Path Edge West Structure ID",
                    "yes",
                    doc.data.structureWest ? doc.data.structureWest : ""
                );
                modalForm.textField(
                    "Path Edge Center Structure ID",
                    "yes",
                    doc.data.structureCenter ? doc.data.structureCenter : ""
                );
                modalForm.textField(
                    "Path Edge walk Structure ID",
                    "yes",
                    doc.data.structureWalk ? doc.data.structureWalk : ""
                );

                modalForm.show(player, false, (player, response) => {
                    if (response.canceled)
                        return uiManager.open(
                            player,
                            versionData.uiNames.UIBuilderEdit,
                            doc.id
                        );
                    let structureID = `${
                        response.formValues[0].split(":").length == 1
                            ? "mystructure:"
                            : ""}${response.formValues[0]}`
                    let structureIDWest = yes(response.formValues[1])
                    let structureIDCenter= yes(response.formValues[2])
                    let structureIDWalk= yes(response.formValues[3])
                    if (world.structureManager.get(structureID)) {
                        doc.data.structure = structureID;
                        if(world.structureManager.get(structureIDWest))doc.data.structureWest = structureIDWest
                        if(world.structureManager.get(structureIDWalk))doc.data.structureWalk = structureIDWalk
                        if(world.structureManager.get(structureIDCenter))doc.data.structureCenter = structureIDCenter;
                        uiBuilder.db.overwriteDataByID(doc.id, doc.data);
                        uiManager.open(
                            player,
                            versionData.uiNames.UIBuilderEdit,
                            doc.id
                        );
                    } else {
                        uiManager.open(
                            player,
                            versionData.uiNames.Basic.Confirmation,
                            `The structure ${structureID} does NOT exist. Are you sure you still want to use it? (The island will not work until the structure is created)`,
                            () => {
                                uiBuilder.db.overwriteDataByID(
                                    doc.id,
                                    doc.data
                                );
                                uiManager.open(
                                    player,
                                    versionData.uiNames.UIBuilderEdit,
                                    doc.id
                                );
                            },
                            () => {
                                uiManager.open(
                                    player,
                                    versionData.uiNames.UIBuilderEdit,
                                    doc.id
                                );
                            }
                        );
                    }
                });
            }
        );
        actionForm.button(
            `§dEdit Spacing\n§r§7${
                !doc.data.spacingX ? "Please set up!" : "Correctfully setup!"
            }`,
            null,
            (player) => {
                let modal = new ModalForm();
                modal.title("Edit island spacing");
                modal.textField(
                    "Spacing X",
                    "100",
                    doc.data.spacingX ? doc.data.spacingX.toString() : "100"
                );
                modal.textField(
                    "Spacing Z",
                    "100",
                    doc.data.spacingZ ? doc.data.spacingZ.toString() : "100"
                );
                modal.textField(
                    "Base X",
                    "10000",
                    doc.data.baseX ? doc.data.baseX.toString() : "10000"
                );
                modal.textField(
                    "Base Y",
                    "200",
                    doc.data.baseY ? doc.data.baseY.toString() : "200"
                );
                modal.textField(
                    "Base Z",
                    "10000",
                    doc.data.baseZ ? doc.data.baseZ.toString() : "10000"
                );
                modal.textField("Max on X coordinate", "10", doc.data.maxOnX ? doc.data.maxOnX.toString() : "10")
                modal.show(player, false, (player, response) => {
                    if (response.canceled)
                        return uiManager.open(
                            player,
                            versionData.uiNames.UIBuilderEdit,
                            doc.id
                        );
                    doc.data.spacingX = nan0(response.formValues[0]);
                    // doc.data.spacingY = nan0(response.formValues[1]);
                    doc.data.spacingZ = nan0(response.formValues[1]);
                    doc.data.baseX = nan0(response.formValues[2]);
                    doc.data.baseY = nan0(response.formValues[3]);
                    doc.data.baseZ = nan0(response.formValues[4]);
                    doc.data.maxOnX = nan0(response.formValues[5]);
                    uiBuilder.db.overwriteDataByID(doc.id, doc.data);
                    uiManager.open(
                        player,
                        versionData.uiNames.UIBuilderEdit,
                        doc.id
                    );
                });
            }
        );
        // world.structureManager.createFromWorld
        actionForm.button(`§dEdit boundaries\n§r§7${doc.data.boundaryX ? "Boundaries set!" : "Boundaries not set"}`, null, (player)=>{
            // doc.data.boundaryX = nan0()
            let modalForm = new ModalForm();
            modalForm.title("Edit Island Boundaries");
            modalForm.label("When a player exits boundaries, something happens")
            modalForm.textField("Boundary Size X", "10", doc.data.boundaryX ? doc.data.boundaryX.toString() : "10")
            modalForm.textField("Boundary Size Y", "10", doc.data.boundaryY ? doc.data.boundaryY.toString() : "10")
            modalForm.textField("Boundary Size Z", "10", doc.data.boundaryZ ? doc.data.boundaryZ.toString() : "10")
            modalForm.dropdown("Boundary Action", [
                {
                    option: "Knockback",
                    callback() {}
                },
                {
                    option: "Teleport to island spawn",
                    callback() {}
                },
                {
                    option: "None",
                    callback() {}
                },
            ], doc.data.boundaryAction ? doc.data.boundaryAction : 0)
            modalForm.textField("Boundary Exit Command (optional)", " ", doc.data.boundaryCommand ? doc.data.boundaryCommand : "")
            modalForm.show(player, false, (player, response)=>{
                doc.data.boundaryX = nan0(response.formValues[1])
                doc.data.boundaryY = nan0(response.formValues[2])
                doc.data.boundaryZ = nan0(response.formValues[3])
                doc.data.boundaryAction = response.formValues[4]
                doc.data.boundaryCommand = response.formValues[5]
            })
        })
        actionForm.button(
            `§eEdit spawn location\n§7${
                typeof doc.data.offX === "number"
                    ? "Corectfuly Setueop"
                    : "Inproperly setup"
            }`,
            null,
            (player) => {
                let modal = new ModalForm();
                modal.title("Edit Island Spawn Location");
                modal.textField(
                    "OffX",
                    "0",
                    doc.data.offX ? doc.data.offX.toString() : "0"
                );
                modal.textField(
                    "OffY",
                    "0",
                    doc.data.offY ? doc.data.offY.toString() : "0"
                );
                modal.textField(
                    "OffZ",
                    "0",
                    doc.data.offZ ? doc.data.offZ.toString() : "0"
                );
                modal.show(player, false, (player, response) => {
                    if (response.canceled)
                        return uiManager.open(
                            player,
                            versionData.uiNames.UIBuilderEdit,
                            doc.id
                        );
                    doc.data.offX = nan0(response.formValues[0]);
                    doc.data.offY = nan0(response.formValues[1]);
                    doc.data.offZ = nan0(response.formValues[2]);
                    uiBuilder.db.overwriteDataByID(doc.id, doc.data);
                    uiManager.open(
                        player,
                        versionData.uiNames.UIBuilderEdit,
                        doc.id
                    );
                });
            }
        );
        if (
            typeof doc.data.offX === "number" &&
            doc.data.spacingX &&
            doc.data.structure &&
            world.structureManager.get(doc.data.structure)
        ) {
            actionForm.button(
                `§bTest\n§7Test this islands location`,
                null,
                (player) => {
                    let structure = world.structureManager.get(
                        doc.data.structure
                    );
                    let originalLoc = {
                        x: Math.floor(player.location.x),
                        y: Math.floor(player.location.y),
                        z: Math.floor(player.location.z),
                    };
                    let cornerLoc = {
                        x: originalLoc.x + structure.size.x,
                        y: originalLoc.y + structure.size.y,
                        z: originalLoc.z + structure.size.z,
                    };
                    let spawnPos = {
                        x: originalLoc.x + doc.data.offX,
                        y: originalLoc.y + doc.data.offY,
                        z: originalLoc.z + doc.data.offZ,
                    };
                    if (!isInCuboid(spawnPos, {...originalLoc, y: 0}, {...cornerLoc, y:6000000})) {
                        player.error("Spawn pos is outside of the structure");
                        return uiManager.open(
                            player,
                            versionData.uiNames.UIBuilderEdit,
                            doc.id
                        );
                    }
                    let blocks = [];
                    let dim = player.dimension;
                    if(!(dim instanceof Dimension)) return;

                    let run = system.runInterval(() => {
                        if (
                            !isInCuboid(player.location, {...originalLoc, y: 0}, {...cornerLoc, y: 6000000})
                        ) {
                            player.sendMessage(
                                "§b§lINFO §r§7>> §bGoing out of test mode"
                            );
                            for(const block of blocks) {
                                let block2 = dim.getBlock(block.loc)
                                block2.setPermutation(block.blockPermutation)
                                if(block.extras && block.extras.includesSign) {
                                    try {
                                        let sign = block2.getComponent("sign");
                                        if(block.extras.text) {
                                            sign.setText(block.extras.text)
                                        }
                                        sign.setWaxed(block.extras.waxed ? true : false)
                                        sign.setTextDyeColor(block.extra.dyeColor)
                                    } catch {}
                                }
                                if(block.extras && block.extras.includesInv) {
                                    try {
                                        let container = block2.getComponent('inventory').container;
                                        for(let i = 0;i < block.extras.items.length;i++) {
                                            container.setItem(block.extras.items[i])
                                        }
                                    } catch {}
                                }
                            }
                            uiManager.open(
                                player,
                                versionData.uiNames.UIBuilderEdit,
                                doc.id
                            );
                            system.clearRun(run);
                        }
                    }, 1);
                    let min = originalLoc;
                    let max = cornerLoc;
                    for (let x = min.x; x <= max.x; x++) {
                        for (let y = min.y; y <= max.y; y++) {
                            for (let z = min.z; z <= max.z; z++) {
                                const p = { x, y, z }; // current voxel UwU
                                // do stuff with p
                                let block = dim.getBlock(p);
                                let extras = {};
                                let sign = block.getComponent(BlockComponentTypes.Sign)
                                if(sign) {
                                    extras.includesSign = true;
                                    extras.text = sign.getRawText() || sign.getText()
                                    extras.waxed = sign.isWaxed
                                    extras.dyeColor = sign.getTextDyeColor()
                                }
                                let inventory = block.getComponent(BlockComponentTypes.Inventory);
                                if(inventory) {
                                    extras.includesInv = true;
                                    extras.items = [];
                                    for(let i = 0;i < inventory.container.size;i++) {
                                        let item = inventory.container.getItem(i)
                                        extras.items.push(item ? item : null)
                                    }
                                }
                                blocks.push({
                                    loc: p,
                                    blockPermutation: block.permutation,
                                    extras
                                })
                            }
                        }
                    }
                    world.structureManager.place(
                        structure.id,
                        player.dimension,
                        originalLoc,
                        {}
                    );
                    player.teleport(spawnPos)
                    // structure.size
                }
            );
        }
    },
});
