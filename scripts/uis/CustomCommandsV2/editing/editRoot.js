import uiBuilder from "../../../api/uiBuilder";
import { ActionForm, ModalForm } from "../../../lib/form_func";
import uiManager from "../../../uiManager";
import versionData from "../../../versionData";
import { NUT_UI_TAG, NUT_UI_THEMED } from "../../preset_browser/nutUIConsts";
import { themes } from "../../uiBuilder/cherryThemes";
import { reRegisterCommands } from "../handler";

uiManager.addUI(versionData.uiNames.CustomCommandsV2.edit, "a", (player, id)=>{
    let form = new ActionForm();
    form.button(`§cBack\n§7Go back`, `textures/azalea_icons/other/door`, player=>{
        uiManager.open(player, versionData.uiNames.UIBuilderEdit, id)
    })
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§r§fEdit Custom Command`)
    let command = uiBuilder.db.getByID(id)
    form.button(`§eEdit Root Command\n§7Edit the root command`, `textures/azalea_icons/other/blip_orange`, player=>{
        uiManager.open(player, versionData.uiNames.CustomCommandsV2.editActions, command.data.actions, (arr)=>{
            command.data.actions = arr;
            uiBuilder.db.overwriteDataByID(command.id, command.data)
            uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, id)
            reRegisterCommands()
        }, true)
    })
    form.button(`§eEdit Subcommands\n§7Edit the subcommands`, `textures/azalea_icons/other/group_edit`, (player)=>{
        let actionForm = new ActionForm();
        actionForm.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§r§fEdit Subcommands`)

        actionForm.button(`§aAdd`, `textures/azalea_icons/other/add`, (player)=>{
            let modalForm = new ModalForm();
            modalForm.title("Add Subcommand")
            modalForm.textField("Name", "type a name for the subcommand", "")
            modalForm.toggle("Ensure Chat Closed", false)
            modalForm.textField("Description", "type a description for the subcommand", "")
            modalForm.toggle("ExecOther", false)
            modalForm.toggle("Don't allow executing on self", false)
            modalForm.show(player, false, (player, response)=>{
                if(response.canceled || !response.formValues[0] || response.formValues[0].includes(' ') || command.data.subcommands.find(_=>_.name == response.formValues[0])) return uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, id);
                command.data.subcommands.push({name: response.formValues[0], actions: [], ensureChatClosed: response.formValues[1], description: response.formValues[2], execother: response.formValues[3], noself: response.formValues[4]})
                uiBuilder.db.overwriteDataByID(command.id, command.data)
                uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, id)
            })
        })
        for(let i = 0; i < command.data.subcommands.length;i++) {
            let subcommand = command.data.subcommands[i];
            let subcommandIndex = i;
            actionForm.button(`§b${subcommand.name}`, `textures/azalea_icons/other/blip_orange`, player=>{
                let form2 = new ActionForm();
                form2.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§r§fEdit Subcommand`)

                form2.button(`§aEdit General`, `textures/azalea_icons/other/script_lightning_edit`, (player)=>{
                    let modalForm = new ModalForm();
                    modalForm.title("Eedit Subcommand")
                    modalForm.textField("Name", "type a name for the subcommand", command.data.subcommands[subcommandIndex].name)
                    modalForm.toggle("Ensure Chat Closed", command.data.subcommands[subcommandIndex].ensureChatClosed)
                    modalForm.textField("Description", "type a description for the subcommand", command.data.subcommands[subcommandIndex].description)
                    modalForm.toggle("ExecOther", command.data.subcommands[subcommandIndex].execother ? true : false)
                    modalForm.toggle("Don't allow executing on self", command.data.subcommands[subcommandIndex].noself ? true : false)
                    modalForm.show(player, false, (player, response)=>{
                        if(response.canceled || !response.formValues[0] || response.formValues[0].includes(' ') || command.data.subcommands.findIndex(_=>_.name == response.formValues[0]) != subcommandIndex) return uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, id);
                        command.data.subcommands[subcommandIndex].name = response.formValues[0]
                        command.data.subcommands[subcommandIndex].ensureChatClosed = response.formValues[1]
                        command.data.subcommands[subcommandIndex].description = response.formValues[2]
                        command.data.subcommands[subcommandIndex].execother = response.formValues[3]
                        command.data.subcommands[subcommandIndex].noself = response.formValues[4]
                        uiBuilder.db.overwriteDataByID(command.id, command.data)
                        uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, id)
                    })
                })
                form2.button(`§cDelete`, `textures/azalea_icons/other/delete`, (player)=>{
                    uiManager.open(player, versionData.uiNames.Basic.Confirmation, "Are you sure you want to delete this subcommand", ()=>{
                        command.data.subcommands.splice(subcommandIndex, 1)
                        uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, id)
                        uiBuilder.db.overwriteDataByID(command.id, command.data)
                    }, ()=>{
                        uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, id)
                    })
                })
                form2.button(`§aEdit Actions`, `textures/azalea_icons/other/blip_orange`, (player)=>{
                    uiManager.open(player, versionData.uiNames.CustomCommandsV2.editActions, command.data.subcommands[subcommandIndex].actions, (arr)=>{
                        command.data.subcommands[subcommandIndex].actions = arr;
                        uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, id)
                        uiBuilder.db.overwriteDataByID(command.id, command.data)
                        reRegisterCommands()
                    }, true)
                })
                form2.show(player, false, ()=>{})
            })
        }
        actionForm.show(player, false, ()=>{})


    })
    form.show(player, false, (player, response)=>{

    })
})