import configAPI from "../api/config/configAPI";
import { ActionForm, ModalForm } from "../lib/form_func";
import uiManager from "../uiManager";
import versionData from "../versionData";
import './generic_string_list_editor.js'
uiManager.addUI(versionData.uiNames.ConfAPIRoot, "", (player)=>{
    let actionForm = new ActionForm();
    actionForm.title(`Developer: Edit Leaf Config Store`)
    actionForm.button(`Root`, `textures/items/config_ui`, (player)=>{
        uiManager.open(player, versionData.uiNames.ConfAPI)
    })
    for(const property in configAPI.propertiesRegistered) {
        if(!configAPI.propertiesRegistered[property].editor) continue;
        actionForm.button(`${configAPI.propertiesRegistered[property].label ? configAPI.propertiesRegistered[property].label : property}`, `textures/items/customizer`, (player)=>{
            configAPI.openEditor(player, property)
        })
    }
    actionForm.show(player, false, (player, response)=>{

    })
})
uiManager.addUI(versionData.uiNames.ConfAPI, "", (player)=>{
    let modalForm = new ModalForm();
    modalForm.title("Leaf Config API Editor");
    modalForm.label("Please note that changing anything in here can break your leaf config heavily. Please be careful!")
    let properties = [];
    for(const property in configAPI.propertiesRegistered) {
        properties.push(property)
        if(configAPI.propertiesRegistered[property].type == configAPI.Types.Boolean) {
            modalForm.toggle(`${property} §6[BOOL]`, configAPI.getProperty(property));
        } else if(configAPI.propertiesRegistered[property].type == configAPI.Types.Number) {
            modalForm.textField(`${property} §b[NUMBER]`, configAPI.getProperty(property).toString(), configAPI.getProperty(property).toString())
        } else if(configAPI.propertiesRegistered[property].type == configAPI.Types.String) {
            modalForm.textField(`${property} §a[STRING]`, configAPI.getProperty(property).toString(), configAPI.getProperty(property).toString())
        } else {
            modalForm.label(`${property} §c[LIST, UNSUPPORTED]`)
        }
    }
    modalForm.show(player, false, (player, response)=>{
        if(response.canceled) return;
        for(let i = 1;i < response.formValues.length;i++) {
            let formValue = response.formValues[i];
            let property = properties[i - 1];
            let propertyType = configAPI.propertiesRegistered[properties[i - 1]].type;
            if(propertyType == configAPI.Types.String) {
                configAPI.setProperty(property, formValue)
            } else if(propertyType == configAPI.Types.Number) {
                let newValue = parseFloat(formValue);
                if(!isNaN(newValue)) configAPI.setProperty(property, newValue)
                else {
                    player.error(`The property you set for ${property} is not a valid number`)
                }
            } else if(propertyType == configAPI.Types.Boolean) {
                configAPI.setProperty(property, formValue)
            }
        }
    })
})