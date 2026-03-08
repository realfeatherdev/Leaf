import configAPI from "../../../api/config/configAPI";
import emojis from "../../../api/emojis";
import icons from "../../../api/icons";
import uiBuilder from "../../../api/uiBuilder";
import { ActionForm } from "../../../lib/form_func";
import uiManager from "../../../uiManager";
import versionData from "../../../versionData";
import {
    NUT_UI_HEADER_BUTTON,
    NUT_UI_TAG,
    NUT_UI_THEMED,
} from "../../preset_browser/nutUIConsts";
import { insertBackButton } from "../../sharedUtils/insertBackButton";
import { themes } from "../cherryThemes";
configAPI.registerProperty("CustomizerCornerAdd", configAPI.Types.Boolean, false)
uiManager.addUI(versionData.uiNames.CustomizerSettings, "a", (player) => {
    let form = new ActionForm();
    form.title(
        `${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§rCustomizer Settings`
    );
    insertBackButton(form, `scriptevent leafgui:ui_builder_main_page`);
    form.label(`§aCreation Count: §r${uiBuilder.getAllUIs().length}`);
    form.button(`§eLeaf Theme\n§7Current: ${themes[configAPI.getProperty("LeafTheme")][1]}`, themes[configAPI.getProperty("LeafTheme")][2], (player)=>{
        uiManager.open(player, "edit_cherry_theme", 0, (id)=>{
            if(id == -2) return uiManager.open(player, versionData.uiNames.CustomizerSettings)
            configAPI.setProperty("LeafTheme", id)
            uiManager.open(player, versionData.uiNames.CustomizerSettings)
        }, configAPI.getProperty("LeafTheme"), false);
    })
    form.button(
        `§dRegistered Icon Packs\n§7View this servers icon packs`,
        `textures/azalea_icons/other/image`,
        (player) => {
            let form2 = new ActionForm();
            form2.title(
                `${NUT_UI_TAG}${NUT_UI_THEMED}${themes[38][0]}§rIcon Packs`
            );
            insertBackButton(form2, `scriptevent leafgui:customizer_settings`);
            for (const iconPack of icons.iconPacks.entries()) {
                form2.button(
                    `§a${iconPack[1].get("pack_name")}\n§7${iconPack[0]}`,
                    iconPack[1].has("pack_icon")
                        ? iconPack[1].get("pack_icon")
                        : `textures/azalea_icons/other/missing`,
                    (player) => {
                        uiManager.open(
                            player,
                            versionData.uiNames.CustomizerSettings
                        );
                    }
                );
            }
            form2.show(player, false, (player, response) => {});
        }
    );
    form.divider();
    form.button(`§cSidebar Settings\n§7Edit global sidebar settings`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.SidebarEditorSettings)
    })
    form.divider();
    form.button(`${configAPI.getProperty("CustomizerCornerAdd") ? emojis.green_dot : emojis.red_dot} §fAdd button on corner\n§r§7Make the customizer have the pre-v4.0 layout`, null, (player)=>{
        configAPI.setProperty("CustomizerCornerAdd", !configAPI.getProperty("CustomizerCornerAdd"))
        uiManager.open(player, versionData.uiNames.CustomizerSettings)
    })
    form.show(player, false, (player, response) => {});
});
