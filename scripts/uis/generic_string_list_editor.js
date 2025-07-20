import configAPI from "../api/config/configAPI";
import { array_move } from "../api/utils/array_move";
import { ActionForm, ModalForm } from "../lib/form_func";
import uiManager from "../uiManager";
import versionData from "../versionData";

uiManager.addUI(versionData.uiNames.ConfigAPIEditors.GenericStringListEditor, "yes", (player, property, backAction = "")=>{
    let currValue = configAPI.getProperty(property);
    let actionForm = new ActionForm();
    actionForm.title(`Edit ${configAPI.propertiesRegistered[property].label ? configAPI.propertiesRegistered[property].label : property}`)
    function reopen() {
        uiManager.open(player, versionData.uiNames.ConfigAPIEditors.GenericStringListEditor, property, backAction)
    }
    actionForm.button(`Add`, `textures/azalea_icons/other/add`, (player)=>{
        let modalForm = new ModalForm();
        modalForm.title(`Add Element`)
        modalForm.textField("Text", "...", "")
        modalForm.show(player, false, (player, response)=>{
            if(response.canceled) return reopen()
            currValue.push(response.formValues[0])
            configAPI.setProperty(property, currValue)
            reopen();
        })
    })
    for(let i = 0;i < currValue.length;i++) {
        let str = currValue[i];
        let curr = i;
        actionForm.button(str, null, (player)=>{
            let actionForm2 = new ActionForm();
            actionForm2.button(`Back`, null, (player)=>{
                reopen();
            })
            actionForm2.button(`Move up`, null, (player)=>{
                array_move(currValue, curr, Math.max(curr - 1, 0))
                configAPI.setProperty(property, currValue)
                reopen();
            })
            actionForm2.button(`Move down`, null, (player)=>{
                array_move(currValue, curr, Math.min(curr + 1, currValue.length - 1))
                configAPI.setProperty(property, currValue)
                reopen();
            })
            actionForm2.button(`Edit`, null, (player)=>{
                let modalForm = new ModalForm();
                modalForm.title(`Edit Element`)
                modalForm.textField("Text", "...", currValue[curr])
                modalForm.show(player, false, (player, response)=>{
                    if(response.canceled) return reopen()
                    currValue[curr] = response.formValues[0]
                    configAPI.setProperty(property, currValue)
                    reopen();
                })
        
            })
            actionForm2.show(player, false, (player, response)=>{})
        })
    }
    actionForm.show(player, false, (player, response)=>{

    })
})