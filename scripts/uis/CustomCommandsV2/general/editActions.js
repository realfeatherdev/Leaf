import { array_move } from "../../../api/utils/array_move";
import { ActionForm, ModalForm } from "../../../lib/form_func";
import uiManager from "../../../uiManager";
import versionData from "../../../versionData";
import { NUT_UI_TAG, NUT_UI_THEMED } from "../../preset_browser/nutUIConsts";
import { themes } from "../../uiBuilder/cherryThemes";

function nan0(number) {
    let num = parseInt(number);
    if(isNaN(num)) return 0;
    return num;
}

uiManager.addUI(versionData.uiNames.CustomCommandsV2.editActions, "A", (player, actions = [], save=()=>{}, rootAction = false)=>{
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§r§fEdit Actions`)
    function reopen() {
        return uiManager.open(player, versionData.uiNames.CustomCommandsV2.editActions, actions, save, rootAction)
    }
    form.button(`Add Action`, `textures/azalea_icons/other/add`, (player)=>{
        let modalForm = new ModalForm();
        modalForm.title("Code Editor")
        modalForm.textField("Add an action here...", "Add an action here...", "")
        modalForm.show(player, false, (player, response)=>{
            if(response.canceled || !response.formValues[0]) return reopen()
            actions.push({type: 0, action: response.formValues[0]})
            reopen()
        })
    })
    form.button(`Add Action Group`, `textures/azalea_icons/other/group_add`, (player)=>{
        let modalForm = new ModalForm();
        modalForm.title("Add Action Group")
        modalForm.textField("Label", "Display name", "", ()=>{}, "A display name for your group")
        modalForm.textField("Condition (optional)", "A tag", "", ()=>{}, "Same as action form button required conditions. If set, will be required to run anything in here")
        modalForm.toggle("Stop Execution", false, ()=>{}, "Stop execution of actions of the group this group is inside of if condition is met.")
        modalForm.textField("Wait time (optional)", "A number", "", ()=>{}, "Optional wait time. The player will have to wait without moving for this to run. Set to zero to disable")
        modalForm.textField("Wait time format", "Some text", "", ()=>{}, "If wait time is enabled, use this text. Leave blank to use default. <r> = time left")
        modalForm.show(player, false, (player, response)=>{
            if(response.canceled || !response.formValues[0] || !response.formValues[1]) return reopen()
            actions.push({
                type: 1,
                label: response.formValues[0],
                condition: response.formValues[1],
                stopExec: response.formValues[2],
                waitTime: nan0(response.formValues[3]),
                waitFormat: response.formValues[4],
                actions: []
            })
            return reopen();
        })
    })
    for(let i = 0;i < actions.length;i++) {
        let action = actions[i]
        let actionIndex = i;
        if(typeof action === "string" || action.type == 0) {
            let isLegacyAction = typeof action === "string";
            form.button(`§6[${isLegacyAction ? "Legacy " : ""}Action] §f${isLegacyAction ? action : action.action}`, null, (player)=>{
                let form2 = new ActionForm();
                form2.button(`§cBack\n§7Go back`, `textures/azalea_icons/other/door`, (player)=>{
                    reopen();
                })
                form2.button(`§aUp`, `textures/azalea_icons/other/arrow_up`, (player)=>{
                    array_move(actions, actionIndex, Math.max(actionIndex - 1, 0))
                    reopen()
                })
                form2.button(`§cDown`, `textures/azalea_icons/other/arrow_down`, (player)=>{
                    array_move(actions, actionIndex, Math.min(actionIndex + 1, actions.length - 1))
                    reopen()
                })
                form2.button(`§dEdit Action`, `textures/azalea_icons/other/blip_orange`, (player)=>{
                    let modalForm = new ModalForm();
                    modalForm.title("Code Editor")
                    modalForm.textField("Add an action here...", "Add an action here...", typeof action === "string" ? action : action.action)
                    modalForm.show(player, false, (player, response)=>{
                        if(response.canceled || !response.formValues[0]) return reopen()
                        if(isLegacyAction) {
                            actions[actionIndex] = response.formValues[0]
                        } else {
                            actions[actionIndex].action = response.formValues[0]
                        }
                        reopen()
                    })
                })
                form2.button(`§cDelete`, `textures/azalea_icons/Delete`, player=>{
                    uiManager.open(player, versionData.uiNames.Basic.Confirmation, `Are you sure you want to delete this ${isLegacyAction ? "legacy " : ""}action?`, ()=>{
                        actions.splice(actionIndex, 1)
                        reopen()
                    }, ()=>{
                        reopen()
                    })
                })
                form2.show(player, false, (player, response)=>{})
            })
        } else if(action.type == 1) {
            form.button(`§b[Group] §f${action.label}`, null, (player)=>{
                let form2 = new ActionForm();
                form2.button(`§cBack\n§7Go back`, `textures/azalea_icons/other/door`, (player)=>{
                    reopen();
                })

                form2.button(`§aUp`, `textures/azalea_icons/other/arrow_up`, (player)=>{
                    array_move(actions, actionIndex, Math.max(actionIndex - 1, 0))
                    reopen()
                })
                form2.button(`§cDown`, `textures/azalea_icons/other/arrow_down`, (player)=>{
                    array_move(actions, actionIndex, Math.min(actionIndex + 1, actions.length - 1))
                    reopen()
                })
                form2.button(`§dEdit Actions`, `textures/azalea_icons/other/blip_orange`, (player)=>{
                    uiManager.open(player, versionData.uiNames.CustomCommandsV2.editActions, action.actions, (arr)=>{
                        actions[actionIndex].actions = arr;
                        reopen();
                    }, false)
                })
                form2.button(`§eEdit General`, `textures/azalea_icons/other/blip_orange`, (player)=>{
                    let modalForm = new ModalForm();
                    modalForm.title("Edit Action Group")
                    modalForm.textField("Label", "Display name", actions[actionIndex].label, ()=>{}, "A display name for your group")
                    modalForm.textField("Condition", "A tag", actions[actionIndex].condition, ()=>{}, "Same as action form button required conditions. Is required to run anything in here")
                    modalForm.toggle("Stop Execution", actions[actionIndex].stopExec, ()=>{}, "Stop execution of actions of the group this group is inside of if condition is met.")
                    modalForm.textField("Wait time (optional)", "A number", typeof actions[actionIndex].waitTime === "number" ? actions[actionIndex].waitTime.toString() : "0", ()=>{}, "Optional wait time. The player will have to wait without moving for this to run")
                    modalForm.textField("Wait time format", "Some text", actions[actionIndex].waitFormat ? actions[actionIndex].waitFormat : "", ()=>{}, "If wait time is enabled, use this text. Leave blank to use default. <r> = time left")
                    modalForm.show(player, false, (player, response)=>{
                        if(response.canceled || !response.formValues[0] || !response.formValues[1]) return reopen()
                        let data = {
                            ...actions[actionIndex],
                            type: 1,
                            label: response.formValues[0],
                            condition: response.formValues[1],
                            stopExec: response.formValues[2],
                            waitTime: nan0(response.formValues[3]),
                            waitFormat: response.formValues[4],
                        }
                        actions[actionIndex] = data;
                        return reopen();
                    })
                })
                form2.button(`§cDelete`, `textures/azalea_icons/Delete`, player=>{
                    uiManager.open(player, versionData.uiNames.Basic.Confirmation, "Are you sure you want to delete this action group?", ()=>{
                        actions.splice(actionIndex, 1)
                        reopen()
                    }, ()=>{
                        reopen()
                    })
                })
                form2.show(player, false, (player, response)=>{})
            })
        }
    }
    form.button(`§aSave`, `textures/azalea_icons/other/disk`, (player)=>{
        save(actions)
    })
    form.show(player, false, (player, response)=>{

    })
})