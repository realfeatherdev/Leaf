import uiBuilder from "../../api/uiBuilder";
import config from "../../versionData";
import { ActionForm, ModalForm } from "../../lib/form_func";
import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../uiManager";
import {
    NUT_UI_DISABLE_VERTICAL_SIZE_KEY,
    NUT_UI_HEADER_BUTTON,
    NUT_UI_LEFT_HALF,
    NUT_UI_RIGHT_HALF,
    NUT_UI_TAG,
} from "../preset_browser/nutUIConsts";
import { world } from "@minecraft/server";
import { array_move } from "../../api/utils/array_move";
import versionData from "../../versionData";
import emojis from "../../api/emojis";

let nonNormalTypes = ['pagstart', 'pagend']

uiManager.addUI(
    config.uiNames.UIBuilderEditButton,
    "Edit Button",
    (player, id, index, buttonIndex) => {
        if (id == 1719775088275) return;
        let actionForm = new ActionForm();
        let ui = uiBuilder.db.getByID(id);

        // Handle buttons in groups
        let button;
        let isGroupButton = typeof buttonIndex === "number";
        if (isGroupButton) {
            // Button is in a group
            button = ui.data.buttons[index]?.buttons[buttonIndex];
            if (!button) {
                // console.warn(
                    // `Failed to find group button at group ${index}, button ${buttonIndex}`
                // );
                return uiManager.open(
                    player,
                    config.uiNames.UIBuilderEditButtons,
                    id
                );
            }
        } else {
            // Regular button
            button = ui.data.buttons[index];
            if (!button) {
                // console.warn(`Failed to find button at index ${index}`);
                return uiManager.open(
                    player,
                    config.uiNames.UIBuilderEditButtons,
                    id
                );
            }
        }
        actionForm.title(
            `${NUT_UI_TAG}§rEditing ${button.type ? button.type : "button"}`
        );
        // world.sendMessage(JSON.stringify(button))
        actionForm.button(
            `${NUT_UI_HEADER_BUTTON}§r§cBack\n§7Go back`,
            `textures/azalea_icons/2`,
            (player) => {
                uiManager.open(player, config.uiNames.UIBuilderEditButtons, id);
            }
        );
        if (button.type == "separator") {
            actionForm.button(
                `§eEdit Properties\n§7Opens the edit menu`,
                `textures/azalea_icons/other/properties_edit`,
                (player) => {
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderAddSeparator,
                        id,
                        index
                    );
                }
            );
        }

        if(button.type == "poll") {
            actionForm.button(
                `§eEdit Poll\n§7Edit this poll`,
                `textures/azalea_icons/other/clipboard`,
                (player)=>{
                    uiManager.open(player, config.uiNames.UIBuilderAddPoll, id, index)
                }
            )
        }

        if (
            button.type != "header" &&
            button.type != "label" &&
            button.type != "divider" &&
            button.type != "separator" &&
            button.type != "poll" && !nonNormalTypes.includes(button.type)
        ) {
            actionForm.button(
                `§eEdit Properties\n§7Opens the edit menu`,
                `textures/azalea_icons/other/properties_edit`,
                (player) => {
                    let doc = uiBuilder.db.getByID(id);
                    if (!doc) return;

                    // Pass both indices for group buttons
                    if (isGroupButton) {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderAddButton,
                            id,
                            index,
                            {
                                isGroupButton: true,
                                buttonIndex: buttonIndex,
                                ...button,
                            }
                        );
                    } else {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderAddButton,
                            id,
                            index
                        );
                    }
                }
            );

            actionForm.button(
                `§uEdit Actions\n§7Edit the actions`,
                `textures/azalea_icons/other/script_edit`,
                (player) => {
                    if(isGroupButton) {
                        uiManager.open(
                            player,
                            "edit_actions",
                            id,
                            index,
                            buttonIndex
                        );
                    } else {
                        uiManager.open(
                            player,
                            versionData.uiNames.CustomCommandsV2.editActions,
                            button.actions ? button.actions : [],
                            (act)=>{
                                ui.data.buttons[index].actions = button.actions;
                                uiBuilder.db.overwriteDataByID(ui.id, ui.data);
                                uiManager.open(player, versionData.uiNames.UIBuilderEditButton, id, index, buttonIndex)
                            }
                        )
                    }
                }
            );
            actionForm.button(`§2Edit Group IDs\n§7${button.gids && button.gids.length ? button.gids.map(_=>_.toString()).join(', ') : `§oNo GIDs set...`}`, button.gids && button.gids.length ? `textures/azalea_icons/other/group_tiles` : `textures/azalea_icons/other/group`, (player)=>{
                let modalForm = new ModalForm();
                modalForm.title("Edit Component GIDs");
                modalForm.textField("GIDs (Comma-Separated)", "§oEnter GIDs here...", button.gids && button.gids.length ? button.gids.map(_=>_.toString()).join(',') : ``, ()=>{}, "§bExamples:§r\n- 1,2,3\n- 1, 5\n- 2")
                modalForm.label("§b§l[INFO] §rGIDs are used in the state components, which can be used to store player preferences")
                modalForm.show(player, false, (player, response)=>{
                    if(response.canceled) return uiManager.open(player, versionData.uiNames.UIBuilderEditButton, id, index, buttonIndex);
                    ui.data.buttons[index].gids = response.formValues[0].split(',').map(_=>parseInt(_.trim())).filter(_=>!isNaN(_));
                    uiBuilder.db.overwriteDataByID(ui.id, ui.data);
                    uiManager.open(player, versionData.uiNames.UIBuilderEditButton, id, index, buttonIndex)
                })
            })
            actionForm.button(
                `§aDuplicate\n§7Create a copy`,
                `textures/azalea_icons/other/node_copy`,
                (player) => {
                    // Create deep copy of the button
                    const buttonCopy = JSON.parse(JSON.stringify(button));
                    buttonCopy.id = Date.now();
                    // Insert copy after current button
                    let doc = uiBuilder.db.getByID(id);
                    doc.data.buttons.splice(index + 1, 0, buttonCopy);
                    uiBuilder.db.overwriteDataByID(id, doc.data);
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderEditButtons,
                        id
                    );
                }
            );
        }

        actionForm.button(
            `${NUT_UI_RIGHT_HALF}${
                index != 0 ? `` : `§p§3§0`
            }${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§r§aMove Up`,
            `textures/azalea_icons/other/arrow_raise`,
            (player) => {
                if (index != 0) {
                    uiBuilder.moveButtonInUI(id, "up", index);
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderEditButtons,
                        id
                    );
                }
            }
        );
        actionForm.button(
            `${NUT_UI_LEFT_HALF}${
                index != ui.data.buttons.length ? `` : `§p§3§0`
            }§r§6Move Down`,
            `textures/azalea_icons/other/arrow_lower`,
            (player) => {
                if (index != ui.data.buttons.length) {
                    uiBuilder.moveButtonInUI(id, "down", index);
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderEditButtons,
                        id
                    );
                }
            }
        );
        actionForm.button(
            `${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}${
                index == 0 ? "§p§3§0" : ""
            }§r§aMove To Top`,
            `textures/azalea_icons/other/arrow_up`,
            (player) => {
                if (index == 0) return;
                for (let i = 0; i < ui.data.buttons.length + 1; i++) {
                    index = uiBuilder.moveButtonInUI(id, "up", index);
                }
                uiManager.open(player, config.uiNames.UIBuilderEditButtons, id);
            }
        );
        actionForm.button(
            `${NUT_UI_LEFT_HALF}${
                index != ui.data.buttons.length - 1 ? `` : `§p§3§0`
            }§r§6Move To Bottom`,
            `textures/azalea_icons/other/arrow_down`,
            (player) => {
                if (index != ui.data.buttons.length - 1) {
                    for (let i = 0; i < ui.data.buttons.length + 1; i++) {
                        index = uiBuilder.moveButtonInUI(id, "down", index);
                    }
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderEditButtons,
                        id
                    );
                }
            }
        );
        actionForm.button(
            `§r§aMove Position`,
            `textures/azalea_icons/other/arrow_up_down`,
            (player) => {
                let modal = new ModalForm();
                modal.slider(
                    `New Position (Current: ${index + 1})`,
                    1,
                    ui.data.buttons.length,
                    1,
                    index + 1
                );
                modal.show(player, false, (player, response) => {
                    if (response.canceled) {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderEditButton,
                            id,
                            index,
                            buttonIndex
                        );
                        return;
                    }
                    // for(let i = 0; i < ui.data.buttons.length + 1;i++) {
                    // index =uiBuilder.moveButtonInUI(id, "down", index);
                    // }
                    array_move(
                        ui.data.buttons,
                        index,
                        response.formValues[0] - 1
                    );
                    uiBuilder.db.overwriteDataByID(ui.id, ui.data);
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderEditButtons,
                        id
                    );
                });
            }
        );
        if (
            button.type != "header" &&
            button.type != "label" &&
            button.type != "divider" &&
            button.type != "separator" &&
            button.type != "poll" && !nonNormalTypes.includes(button.type)
        ) {
            if(!isGroupButton) {

                actionForm.button(`§dComment (editor-only)\n§7Set a comment for this button`, `textures/azalea_icons/other/dialogue`, (player)=>{
                    let modal = new ModalForm();
                    modal.title("Edit Button Comment")
                    modal.textField("Comment", "Write a comment for this button", button.comment ? button.comment : "");
                    modal.show(player, false, (player, response)=>{
                        if(response.canceled) return uiManager.open(player, versionData.uiNames.UIBuilderEditButton, id, index, buttonIndex)
                        button.comment = response.formValues[0]
                        // button.template.start = Math.max(0, parseInt(isNaN(response.formValues[3]) ? 0 : response.formValues[3]))
                        // button.template.end = Math.max(0, parseInt(isNaN(response.formValues[4]) ? 0 : response.formValues[4]))
                        ui.data.buttons[index] = button;
                        uiBuilder.db.overwriteDataByID(ui.id, ui.data);
    
                        return uiManager.open(player, versionData.uiNames.UIBuilderEditButton, id, index, buttonIndex)
    
                    })
                })
                if(button.comment) {
                    actionForm.label(`${emojis.orange_dot} §6${button.comment}`)
                }
                actionForm.button(`§bTemplate\n§7Mass duplicate+edit this button`, `textures/azalea_icons/other/voxel`, (player)=>{
                    let modal = new ModalForm();
                    if(!button.template) button.template = {};
                    modal.title("Edit Button Template")
                    modal.label("Button will repeat a specific amount of times when displaying UI to the user.")
                    modal.label("Use <#> anywhere in the button info to use the number")
                    modal.toggle("Enable Template", button.template.on ? true : false)
                    modal.textField("Starting Number", "1", typeof button.template.start === "number" ? button.template.start.toString() : "1")
                    modal.textField("Ending Number", "10", typeof button.template.end === "number" ? button.template.end.toString() : "10")
                    modal.show(player, false, (player, response)=>{
                        if(response.canceled) return uiManager.open(player, versionData.uiNames.UIBuilderEditButton, id, index, buttonIndex)
                        button.template.on = response.formValues[2]
                        button.template.start = Math.max(0, parseInt(isNaN(response.formValues[3]) ? 0 : response.formValues[3]))
                        button.template.end = Math.max(0, parseInt(isNaN(response.formValues[4]) ? 0 : response.formValues[4]))
                        ui.data.buttons[index] = button;
                        uiBuilder.db.overwriteDataByID(ui.id, ui.data);

                        return uiManager.open(player, versionData.uiNames.UIBuilderEditButton, id, index, buttonIndex)
                    })
                })
                if(button.template && button.template.on) {
                    actionForm.label(`Button Template, From §a${button.template.start} §fto §a${button.template.end}`)
                }
            }
        }
        if(button.type == "label") {
            actionForm.button(`${NUT_UI_HEADER_BUTTON}§r${button.raw ? "Set to normal mode" : "Set to raw mode"}`, `textures/azalea_icons/other/button_xbox_y`, player=>{
                button.raw = !button.raw;
                let form = uiBuilder.db.getByID(id);
                form.data.buttons[index] = button;
                uiBuilder.db.overwriteDataByID(form.id, form.data);
                uiManager.open(player, config.uiNames.UIBuilderEditButton, id, index, buttonIndex)
            })
            if(button.raw) actionForm.label(`Raw Mode`)
        }
        if (button.type == "header" || button.type == "label") {
            actionForm.button(
                `§eEdit Text\n§7Edit the ${button.type}`,
                null,
                (player) => {
                    let modal = new ModalForm();
                    modal.title("Code Editor");
                    modal.textField(
                        "Text",
                        "Sample Text",
                        button.text ? button.text : ""
                    );
                    modal.show(player, false, (player, response) => {
                        if (response.canceled)
                            return uiManager.open(
                                player,
                                config.uiNames.UIBuilderEditButton,
                                id,
                                index
                            );
                        button.text = response.formValues[0];
                        let form = uiBuilder.db.getByID(id);
                        form.data.buttons[index] = button;
                        uiBuilder.db.overwriteDataByID(form.id, form.data);
                        return uiManager.open(
                            player,
                            config.uiNames.UIBuilderEditButton,
                            id,
                            index
                        );
                    });
                }
            );
        }
        actionForm.button(
            `§c§h§e§1§r§cDelete\n§7Deletes the button`,
            `textures/azalea_icons/Delete`,
            (player) => {
                uiManager.open(
                    player,
                    config.uiNames.Basic.Confirmation,
                    "Are you sure you want to delete this button?",
                    () => {
                        let doc = uiBuilder.db.getByID(id);
                        if (!doc) return;

                        if (isGroupButton) {
                            // Delete button from group
                            let group = doc.data.buttons[index];
                            if (group && group.buttons) {
                                group.buttons = group.buttons.filter(
                                    (_, i) => i !== buttonIndex
                                );
                                uiBuilder.db.overwriteDataByID(id, doc.data);
                            }
                        } else {
                            // Delete regular button
                            doc.data.buttons = doc.data.buttons.filter(
                                (_, i) => i !== index
                            );
                            uiBuilder.db.overwriteDataByID(id, doc.data);
                        }

                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderEditButtons,
                            id
                        );
                    },
                    () => {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderEditButton,
                            id,
                            index,
                            buttonIndex
                        );
                    }
                );
            }
        );

        if (
            button.type != "header" &&
            button.type != "label" &&
            button.type != "divider" &&
            button.type != "separator" &&
            button.type != "poll" && !nonNormalTypes.includes(button.type)
        ) {
            actionForm.button(
                `§dEdit Meta (Advanced)\n§7${button.meta ? button.meta : "Change functionality of this button"}`,
                `textures/azalea_icons/ExtIcon`,
                (player) => {
                    uiManager.open(player, versionData.uiNames.UIBuilderEditButtonMeta, button.meta ? button.meta : "", (res)=>{
                        if(typeof res === "string") {
                            uiBuilder.editButtonMeta(
                                id,
                                button.id,
                                res
                            );
                        }

                        uiManager.open(player, versionData.uiNames.UIBuilderEditButton, id, index, buttonIndex)
                    })
                    return;
                    let form = new ModalForm();
                    form.title("Edit Meta");
                    form.textField(
                        "Meta",
                        "Meta here...",
                        button.meta ? button.meta : ""
                    );
                    form.show(player, false, (player, response) => {}).then(
                        (res) => {
                            if (res.canceled)
                                return uiManager.open(
                                    player,
                                    config.uiNames.UIBuilderEditButton,
                                    id,
                                    index
                                );
                            uiBuilder.editButtonMeta(
                                id,
                                button.id,
                                res.formValues[0]
                            );
                            uiManager.open(
                                player,
                                config.uiNames.UIBuilderEditButton,
                                id,
                                index
                            );
                        }
                    );
                }
            );
            actionForm.divider();
            actionForm.button(
                `§bEdit Icon Overrides [DEPRECATED]\n§7Override icons based on a condition`,
                `textures/azalea_icons/DevSettings2`,
                (player) => {
                    uiManager.open(player, "edit_icon_overrides", id, index);
                }
            );
        }
        actionForm.show(player, false, () => {});
    }
);
