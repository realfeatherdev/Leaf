import homes from "../../api/homes.js";
import { ActionForm, ModalForm } from "../../lib/form_func.js";
import { ModalFormData } from "@minecraft/server-ui";
import { world } from "@minecraft/server";
import { NUT_UI_TAG } from "../preset_browser/nutUIConsts.js";
import uiManager from "../../uiManager.js";
import config from "../../versionData.js";
import icons from "../../api/icons.js";
import playerStorage from "../../api/playerStorage.js";
import { insertBackButton } from "../sharedUtils/insertBackButton.js";

uiManager.addUI(config.uiNames.Homes.View, "View homes", (player, id) => {
    let h = homes.get(id, player);
    if (!h) return uiManager.open(player, config.uiNames.Homes.Root);
    let form = new ActionForm();
    insertBackButton(form, "/scriptevent leafgui:homes", true);
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§f` + "View home: " + h.data.name);
    // form.body(`Name: ${h.data.name}`);
    form.button(
        `§aTeleport\n§7${h.data.bed ? "Teleport to your bed" : "Teleport to this home"}`,
        icons.resolve(`^textures/items/ender_eye`),
        (player) => {
            homes.teleport(id, player);
        }
    );
    // form.button(`Share and remove owner`, null, (player)=>{
    //     h.data.sharedTo = [player.name];
    //     h.data.owner = "-1";
    //     homes.db.overwriteDataByID(h.id, h.data);
    // })
    if (h.data.owner == playerStorage.getID(player)) {
        form.divider();
        form.button(`§aSet Icon\n§7Set the icon of this home`, h.data.icon ? icons.resolve(h.data.icon) ?? "textures/azalea_icons/icontextures/tile2_004" : "textures/azalea_icons/icontextures/tile2_004", (player)=>{
            let form2 = new ActionForm();
            form2.title("Set Home Icon");
            form2.button(`Back`, `textures/azalea_icons/2`, (player)=>{
                uiManager.open(player, config.uiNames.Homes.View, id)
            })
            for(const key of Object.keys(homes.homeIcons)) {
                let ic = homes.homeIcons[key];
                form2.button(key, icons.resolve(ic[1]), (player)=>{
                    let form3 = new ActionForm();
                    form3.title(key)
                    form3.button(`Back`, `textures/azalea_icons/2`, (player)=>{
                        uiManager.open(player, config.uiNames.Homes.View, id)
                    })
                    for(let i = 0;i < ic.length;i += 2) {
                        form3.button(ic[i], icons.resolve(ic[i + 1]), (player)=>{
                            h.data.icon = ic[i + 1];
                            homes.db.overwriteDataByID(h.id, h.data);
                            uiManager.open(player, config.uiNames.Homes.View, id)

                        })
                    }
                    form3.show(player, false, (player, response)=>{})
                })
            }
            form2.show(player, false, (player, response)=>{})
        })
        form.button(`§dChange Name\n§7Change the name of this home`, `textures/azalea_icons/icontextures/name_tag`, (player)=>{
            let modal = new ModalForm();
            modal.textField("New Name", " ", h.data.name, ()=>{})
            modal.show(player, false, (player, response)=>{
                if(response.formValues[0] == h.data.name) return uiManager.open(player, config.uiNames.Homes.Root)
                if(!response.formValues[0]) {
                    player.error("You cannot have empty home name!")
                    return uiManager.open(player, config.uiNames.Homes.View, id)
                }
                if(homes.isHomeAlreadyMade(response.formValues[0], player)) {
                    player.error("This home already exists on your user")
                    return uiManager.open(player, config.uiNames.Homes.View, id)
                }
                h.data.name = response.formValues[0];
                homes.db.overwriteDataByID(h.id, h.data);
                return uiManager.open(player, config.uiNames.Homes.Root)
            })
        })

    }
    if (h.data.owner == playerStorage.getID(player)) {
        form.button(
            `§bShare home\n§7Share this home with other players`,
            icons.resolve("^textures/azalea_icons/4"),
            (player) => {
                let form2 = new ActionForm();
                form2.title("Share home!");
                form2.button(
                    `§cBack\n§7Back to home ui`,
                    "textures/azalea_icons/2.png",
                    (player) => {
                        uiManager.open(player, config.uiNames.Homes.View, id);
                    }
                );
                for (const plr of world.getPlayers()) {
                    if (plr.name == player.name) continue;
                    if (!h.data.sharedTo) h.data.sharedTo = [];
                    if (h.data.sharedTo.includes(plr.name)) continue;
                    form2.button(
                        `§a${plr.name}\n§7[Click to share]`,
                        // "textures/azalea_icons/4",
                        null,
                        (player) => {
                            homes.shareHome(id, plr);
                            uiManager.open(
                                player,
                                config.uiNames.Homes.View,
                                id
                            );
                        }
                    );
                }
                form2.show(player);
            }
        );
        form.button(
            `§cRemove Share\n§7Remove someone from shared home`,
            icons.resolve("^textures/azalea_icons/4"),
            (player) => {
                let form2 = new ActionForm();
                form2.title("Share home!");
                form2.button(
                    `§cBack\n§7Back to home ui`,
                    "textures/azalea_icons/2.png",
                    (player) => {
                        uiManager.open(player, config.uiNames.Homes.View, id);
                    }
                );
                for (const sh of h.data.sharedTo) {
                    form2.button(
                        `§a${sh}\n§7[Click to remove]`,
                        "textures/azalea_icons/Delete",
                        (player) => {
                            homes.removeShare(id, sh);
                            uiManager.open(
                                player,
                                config.uiNames.Homes.View,
                                id
                            );
                        }
                    );
                }
                form2.show(player);
            }
        );
        form.divider();
    }
    if(h.data.owner == playerStorage.getID(player)) {
        form.button(
            "§cDelete\n§7Delete this home",
            "textures/azalea_icons/Delete",
            (player) => {
                homes.delete(id);
                uiManager.open(player, config.uiNames.Homes.Root);
            }
        );

    }
    form.show(player);
});
