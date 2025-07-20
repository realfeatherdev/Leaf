import uiBuilder from "../../../api/uiBuilder";
import { ModalForm } from "../../../lib/form_func";
import uiManager from "../../../uiManager";
import versionData from "../../../versionData";

function genPollID() {
    return ((Date.now() * 1000) + Math.floor(Math.random() * 1000)).toString('16')
}

uiManager.addUI(versionData.uiNames.UIBuilderAddPoll, "Add a poll...?", (player, id, index = -1)=>{
    let form = new ModalForm();
    form.title(`Add a poll`)
    let ui = uiBuilder.db.getByID(id)
    if(!ui) return;
    let button = index > -1 ? ui.data.buttons[index] : null;
    if(button && button.type != "poll") return;
    form.textField("Poll Title", "Type the poll title", button && button.title ? button.title : "Example title")
    form.textField("Option 1", "Type option 1", button && button.options.length > 0 ? button.options[0] : "Example option")
    form.textField("Option 2", "Type option 2", button && button.options.length > 1 ? button.options[1] : "")
    form.textField("Option 3", "Type option 3", button && button.options.length > 2 ? button.options[2] : "")
    form.textField("Option 4", "Type option 4", button && button.options.length > 3 ? button.options[3] : "")
    form.textField("Option 5", "Type option 5", button && button.options.length > 4 ? button.options[4] : "")
    form.textField("Poll Option Subtext", "[ Click to Vote ]", button && button.optionSubtext ? button.optionSubtext : "")
    form.toggle("Disable Poll", button && button.disabled ? button.disabled : false)
    form.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, versionData.uiNames.UIBuilderEditButtons, id)
        let options = [response.formValues[1], response.formValues[2], response.formValues[3], response.formValues[4], response.formValues[5]].filter(_=>_ && _.length > 0).map(_=>_.trim())
        if(!options.length) options.push(`Example option`);
        let button2 = {options, optionSubtext: response.formValues[6], disabled: response.formValues[7], title: response.formValues[0], pollID: button ? button.pollID : genPollID(), type: "poll"}
        let ui = uiBuilder.db.getByID(id)
        if(index > -1) {
            ui.data.buttons[index] = button2;
        } else {
            ui.data.buttons.push(button2)
        }
        uiBuilder.db.overwriteDataByID(ui.id, ui.data)
        uiManager.open(player, versionData.uiNames.UIBuilderEditButtons, id)
    })
})