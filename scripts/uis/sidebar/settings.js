import sidebarEditor from "../../api/sidebarEditor";
import config from "../../versionData";
import uiManager from "../../uiManager";
import { ModalForm } from "../../lib/form_func";
import { world } from "@minecraft/server";
import { prismarineDb } from "../../lib/prismarinedb";
import { sidebarConfig } from "../../configs";
import configAPI from "../../api/config/configAPI";
uiManager.addUI(
    config.uiNames.SidebarEditorSettings,
    "Sidebar editor root",
    (player) => {
        let form = new ModalForm();
        form.title("Sidebar Settings")
        form.toggle("Enable Sidebar System", configAPI.getProperty("Sidebar"));
        form.slider("Sidebar Refresh Rate", 1, 5, 1, configAPI.getProperty("SidebarUpdateRate"), ()=>{}, "How frequently the sidebar updates, in ticks.\nLower number = faster refresh");
        form.show(player, false, (player, response) => {
            configAPI.setProperty("Sidebar", response.formValues[0])
            configAPI.setProperty("SidebarUpdateRate", response.formValues[1])
            if (!response.formValues[0]) {
                for (const player of world.getPlayers())
                    player.onScreenDisplay.setTitle("");
            }
            uiManager.open(player, config.uiNames.CustomizerSettings);
        });
    }
);
