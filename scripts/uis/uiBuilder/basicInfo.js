import configAPI from "../../api/config/configAPI";
import { ModalForm } from "../../lib/form_func";
import uiManager from "../../uiManager";
import versionData from "../../versionData";

uiManager.addUI(versionData.uiNames.BasicInfo, "FREFER", (player)=>{
    let modal = new ModalForm();
    modal.title("Basic Server Info");
    modal.textField("Server Name", "Edit your servers name...", configAPI.getProperty("ServerName2") == "Unknown Server" ? "" : configAPI.getProperty("ServerName2"), ()=>{})
    modal.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, versionData.uiNames.ConfigRoot)
        configAPI.setProperty("ServerName2", response.formValues[0])
        return uiManager.open(player, versionData.uiNames.ConfigRoot)
    })
})