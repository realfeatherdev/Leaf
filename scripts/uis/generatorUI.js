import { BlockTypes, system, world } from "@minecraft/server";
import generator from "../api/generator";
import config from "../versionData";
import { ActionForm, ModalForm } from "../lib/form_func";
import uiManager from "../uiManager";
import { prismarineDb } from "../lib/prismarinedb";
import configAPI from "../api/config/configAPI";
import { NUT_UI_ALT, NUT_UI_DISABLE_VERTICAL_SIZE_KEY, NUT_UI_HEADER_BUTTON, NUT_UI_LEFT_THIRD, NUT_UI_MIDDLE_THIRD, NUT_UI_RIGHT_THIRD } from "./preset_browser/nutUIConsts";

uiManager.addUI(
    config.uiNames.Generator.Create,
    "Create Generator",
    (player, blockTypeID) => {
        if (!configAPI.getProperty("Generators"))
            return player.sendMessage("Generators are not enabled");
        let modalForm = new ModalForm();
        modalForm.textField(
            `You are making a generator for block ${blockTypeID}\n\nGenerator Name`,
            "Gold Generator",
            undefined
        );
        modalForm.textField(
            "Respawn Time",
            "Respawn Time (in seconds)",
            undefined
        );
        modalForm.textField(
            "Scriptevent to give player the item",
            "gold_gen",
            undefined
        );

        modalForm.toggle(
            "Enable floating text",
            false,
            () => {},
            "Enables the generators information floating text."
        )

        modalForm.toggle(
            "Enable generator sound",
            false,
            () => {},
            "Enables the generators spawn and break sound."
        )

        modalForm.toggle(
            "Enable generator particles",
            false,
            () => {},
            "Enables the generators spawn and break particles."
        )

        modalForm.show(player, false, (player, response) => {
            if (response.canceled) return;
            const showText = response.formValues[3]; 

            if (
                !response ||
                response.canceled ||
                !response.formValues ||
                !response.formValues[0] ||
                !response.formValues[1] ||
                !/^\d+$/.test(response.formValues[1]) ||
                !response.formValues[2]
            )
                return uiManager.open(
                    player,
                    config.uiNames.Generator.Create,
                    blockTypeID
                );
            generator.addGenerator(
                response.formValues[0],
                blockTypeID,
                parseInt(response.formValues[1]),
                response.formValues[2],
                showText // Pass the new boolean here
            );
        });
    }
);
uiManager.addUI(
    config.uiNames.Generator.EditRoot,
    "Generator Edit Root",
    (player) => {
        if (!configAPI.getProperty("Generators"))
            return player.sendMessage("Generators are not enabled");
        let form = new ActionForm();
        form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}Generators`);
        form.label(`To make a §dgenerator§f:\n§71. §fGrab the "generator editor" item\n§72. §fUse it on the block you want to make a gen out of`)
        form.button(`${NUT_UI_HEADER_BUTTON}§cBack`, `textures/azalea_icons/2`, (player)=>{
            uiManager.open(player, config.uiNames.Config.Misc)
        })
        for (const generatorData of generator.getGenerators()) {
            form.button(
                `§a${generatorData.data.name}\n§r§7${
                    generatorData.data.scriptevent
                        ? generatorData.data.scriptevent
                        : "N/A"
                }`,
                null,
                (player) => {
                    uiManager.open(
                        player,
                        config.uiNames.Generator.EditGenerator,
                        generatorData.id
                    );
                }
            );
        }
        form.show(player, false, () => {});
    }
);
let effects = ["Default", "Magic", "Nature", "Lava"];
uiManager.addUI(config.uiNames.Generator.EditGenerator, "a", (player, id) => {
    if (!configAPI.getProperty("Generators"))
        return player.sendMessage("Generators are not enabled");
    let gen = generator.db.getByID(id);
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}${gen.data.name}`);
    form.button(`${NUT_UI_HEADER_BUTTON}§cBack`, `textures/azalea_icons/2`, (player)=>{
        uiManager.open(player, config.uiNames.Generator.EditRoot)
    })
    form.button(`§eEdit Basic Info\n§7Edit basic info for this generator`, `textures/azalea_icons/misc`, (player)=>{
        let modalForm = new ModalForm();
        modalForm.title("Edit Basic Info");
        modalForm.textField("Name", "Generator name", gen.data.name ? gen.data.name : "Default");
        modalForm.textField("Block ID", "minecraft:dirt", gen.data.block ? gen.data.block : "minecraft:dirt");
        modalForm.textField("Unique ID", "meow", gen.data.scriptevent ? gen.data.scriptevent : "meow", ()=>{}, "Get the item by doing /scriptevent leaf:give_gen <unique id>");
        modalForm.show(player, false, (player, response)=>{
            if(response.canceled) return uiManager.open(player, config.uiNames.Generator.EditGenerator, id)
            let blockID = BlockTypes.get(response.formValues[1]) ? response.formValues[1] : "minecraft:dirt";
            if(!BlockTypes.get(response.formValues[1])) player.warn(`Block type: ${response.formValues[1]} not found. Defaulting to minecraft:dirt`)
            gen.data.block = blockID;
            gen.data.name = response.formValues[0]
            gen.data.scriptevent = response.formValues[2]
            return uiManager.open(player, config.uiNames.Generator.EditGenerator, id)
        })
    })
    form.button(`§uGet Generator Item\n§7Get this generators item :3`, `textures/items/paper`, (player)=>{
        player.runCommand(`scriptevent leaf:give_gen ${gen.data.scriptevent}`)
        return uiManager.open(player, config.uiNames.Generator.EditGenerator, id)
    })
    form.button("§dEdit Upgrades\n§7Edit this generators upgrades!", `textures/azalea_icons/ChestLarge`, (player) => {
        uiManager.open(
            player,
            config.uiNames.Generator.EditGeneratorUpgrades,
            id
        );
    });
    form.button(`§cEdit Effect\n§7Current: ${effects[gen.data.effect ? gen.data.effect : 0]}`, `textures/azalea_icons/10`, (player) => {
        let modal = new ModalForm();
        modal.dropdown(
            "Effect",
            effects.map((_) => {
                return { option: _, callback() {} };
            }),
            gen.data.effect ? gen.data.effect : 0
        );
        modal.show(player, false, (player, response) => {
            if (response.canceled)
                return uiManager.open(
                    player,
                    config.uiNames.Generator.EditGenerator
                );
            gen.data.effect = response.formValues[0];
            generator.db.overwriteDataByID(gen.id, gen.data);
            return uiManager.open(
                player,
                config.uiNames.Generator.EditGenerator,
                id
            );
        });
    });
    form.button(
        `§bEdit Base Cooldown\n§7Current: ${gen.data.respawnTime}`,
        `textures/items/clock_item`,
        (player) => {
            let modal = new ModalForm();
            modal.textField(
                "Respawn Time",
                `${gen.data.respawnTime}`,
                gen.data.respawnTime.toString()
            );
            modal.show(player, false, (player, response) => {
                if (response.canceled)
                    return uiManager.open(
                        player,
                        config.uiNames.Generator.EditGeneratorUpgrades,
                        id
                    );
                gen.data.respawnTime = isNaN(parseInt(response.formValues[0]))
                    ? 0
                    : parseInt(response.formValues[0]);
                generator.db.overwriteDataByID(gen.id, gen.data);
                return uiManager.open(
                    player,
                    config.uiNames.Generator.EditGenerator,
                    id
                );
            });
        }
    );
    form.button(
        `${NUT_UI_LEFT_THIRD}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§r§fFloating Text${ gen.data.showText ? `\n§r§aON`: `\n§r§cOFF`}`,
        // `textures/azalea_icons/label`,
        null,
        (player) => {
            gen.data.showText = !gen.data.showText
            generator.db.overwriteDataByID(gen.id, gen.data);
            return uiManager.open(
                player,
                config.uiNames.Generator.EditGenerator,
                id
            );
        }
    );
    form.button(
        `${NUT_UI_MIDDLE_THIRD}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§r§fSounds${ gen.data.enableGeneratorSound ? `\n§r§aON`: `\n§r§cOFF`}`,
        // `textures/blocks/noteblock`,
        null,
        (player) => {
            gen.data.enableGeneratorSound = !gen.data.enableGeneratorSound
            generator.db.overwriteDataByID(gen.id, gen.data);
            return uiManager.open(
                player,
                config.uiNames.Generator.EditGenerator,
                id
            );
        }
    );
    form.button(
        `${NUT_UI_RIGHT_THIRD}§r§fParticles${ gen.data.enableGeneratorParticle ? `\n§r§aON`: `\n§r§cOFF`}`,
        // `textures/azalea_icons/main`,
        null,
        (player) => {
            gen.data.enableGeneratorParticle = !gen.data.enableGeneratorParticle
            generator.db.overwriteDataByID(gen.id, gen.data);
            return uiManager.open(
                player,
                config.uiNames.Generator.EditGenerator,
                id
            );
        }
    );
    form.button(`§cDelete\n§7Delete this generator`, `textures/azalea_icons/Delete`, (player) => {
        uiManager.open(
            player,
            config.uiNames.Basic.Confirmation,
            "Are you sure you want to delete this generator?",
            () => {
                generator.db.deleteDocumentByID(gen.id);
                return uiManager.open(
                    player,
                    config.uiNames.Generator.EditRoot
                );
            },
            () => {
                return uiManager.open(
                    player,
                    config.uiNames.Generator.EditGenerator,
                    id
                );
            }
        );
    });
    form.show(player, false, () => {});
});
uiManager.addUI(
    config.uiNames.Generator.EditGeneratorUpgrades,
    "a",
    (player, id) => {
        if (!configAPI.getProperty("Generators"))
            return player.sendMessage("Generators are not enabled");
        let gen = generator.db.getByID(id);
        let form = new ActionForm();
        form.button("New Upgrade", null, (player) => {
            let modal = new ModalForm();
            modal.textField("Respawn Time (in seconds)", "10");
            modal.textField("Price", "120");
            let vals1 = prismarineDb.economy
                .getCurrencies()
                .map((_) => `${_.symbol} ${_.displayName}`);
            let vals2 = prismarineDb.economy
                .getCurrencies()
                .map((_) => _.scoreboard);
            modal.dropdown(
                `Currency`,
                vals1.map((_) => {
                    return {
                        option: _,
                        callback() {},
                    };
                })
            );
            modal.show(player, false, (player, response) => {
                if (response.canceled)
                    return uiManager.open(
                        player,
                        config.uiNames.Generator.EditGeneratorUpgrades,
                        id
                    );
                if (
                    !response.formValues[0] ||
                    !response.formValues[1] ||
                    !/^\d+$/.test(response.formValues[0]) ||
                    !/^\d+$/.test(response.formValues[1])
                )
                    return;
                generator.addGeneratorUpgrade(
                    id,
                    parseInt(response.formValues[0]),
                    vals2[response.formValues[2]],
                    parseInt(response.formValues[1])
                );
                return uiManager.open(
                    player,
                    config.uiNames.Generator.EditGenerator,
                    id
                );
            });
        });
        let i = 1;
        for (const upgrade of gen.data.upgrades) {
            i++;
            let currency = prismarineDb.economy.getCurrency(upgrade.currency)
                ? prismarineDb.economy.getCurrency(upgrade.currency)
                : prismarineDb.economy.getCurrency("default");
            form.button(
                `Level ${i} (${upgrade.respawnTime}s)\n${currency.symbol} ${upgrade.price}`,
                null,
                (player) => {
                    let form2 = new ActionForm();
                    form2.button(`Back`, null, (player) => {
                        return uiManager.open(
                            player,
                            config.uiNames.Generator.EditGeneratorUpgrades,
                            id
                        );
                    });
                    form2.button(`Edit Cooldown`, null, (player) => {
                        let modal = new ModalForm();
                        modal.textField(
                            "Respawn Time",
                            `${upgrade.respawnTime}`,
                            upgrade.respawnTime.toString()
                        );
                        modal.show(player, false, (player, response) => {
                            if (response.canceled)
                                return uiManager.open(
                                    player,
                                    config.uiNames.Generator
                                        .EditGeneratorUpgrades,
                                    id
                                );
                            upgrade.respawnTime = isNaN(
                                parseInt(response.formValues[0])
                            )
                                ? 0
                                : parseInt(response.formValues[0]);
                            generator.db.overwriteDataByID(gen.id, gen.data);
                            return uiManager.open(
                                player,
                                config.uiNames.Generator.EditGeneratorUpgrades,
                                id
                            );
                        });
                    });
                    // form2.button()
                    form2.button("Delete", null, (player) => {
                        uiManager.open(
                            player,
                            config.uiNames.Basic.Confirmation,
                            "Are you sure you want to delete this upgrade?",
                            () => {
                                gen.data.upgrades.splice(i - 2, 1);
                                generator.db.overwriteDataByID(
                                    gen.id,
                                    gen.data
                                );
                                return uiManager.open(
                                    player,
                                    config.uiNames.Generator
                                        .EditGeneratorUpgrades,
                                    id
                                );
                            },
                            () => {
                                return uiManager.open(
                                    player,
                                    config.uiNames.Generator
                                        .EditGeneratorUpgrades,
                                    id
                                );
                            }
                        );
                    });
                    form2.show(player, false, (player, response) => {});
                }
            );
        }
        form.show(player, false, () => {});
    }
);
let blockMap = new Map();
system.runInterval(() => {
    blockMap.clear();
}, 20);
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
    if (blockMap.has(e.player.id)) return;
    blockMap.set(e.player.id, true);
    if (e.itemStack && e.itemStack.typeId == "leaf:generator_editor") {
        system.run(() => {
            uiManager.open(
                e.player,
                config.uiNames.Generator.Create,
                e.block.typeId
            );
        });
    }
});
