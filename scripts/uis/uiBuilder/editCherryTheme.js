import uiBuilder from "../../api/uiBuilder";
import { ActionForm } from "../../lib/form_func";
import uiManager from "../../uiManager";
import versionData from "../../versionData";
import {
    NUT_UI_TAG,
    NUT_UI_HEADER_BUTTON,
    NUT_UI_THEMED,
    NUT_UI_LEFT_HALF,
    NUT_UI_DISABLE_VERTICAL_SIZE_KEY,
    NUT_UI_RIGHT_HALF,
} from "../preset_browser/nutUIConsts";
import { themes } from "./cherryThemes";
uiManager.addUI(
    "edit_cherry_theme",
    "Edits the cherry theme!",
    (player, id, overrideShit = null, currTheme = 0, showNegative1Btn) => {
        try {
            let doc = overrideShit ? null : uiBuilder.db.getByID(id);
            let form = new ActionForm();
            let themeID = overrideShit ? currTheme : doc.data.theme ? doc.data.theme : 0;
            let yes =
                themeID > 0 ? `${NUT_UI_THEMED}${themes[themeID][0]}` : ``;
            form.title(`${NUT_UI_TAG}${yes}§r§fThemes`);
            form.button(
                `${NUT_UI_HEADER_BUTTON}§r§c§lGo Back\n§r§7Click to go back`,
                `textures/azalea_icons/2`,
                (player) => {
                    if(overrideShit) {
                        overrideShit(-2)
                    } else {
                        uiManager.open(
                            player,
                            versionData.uiNames.UIBuilderEdit,
                            id
                        );
                    }
                }
            );
            if(showNegative1Btn && overrideShit) {
                form.button(`${themeID == -1 ? "§o§1§r§f" : ""}Inherit`, null, (player)=>{
                    overrideShit(-1)
                })
            }
            for (let i = 0; i < themes.length; i++) {
                let theme = themes[i];
                let themeIndex = i;
                let al1 = `${NUT_UI_LEFT_HALF}`;
                let al2 = `${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}`;
                form.button(
                    `${
                        i % 2 != 0
                            ? al1
                            : i == themes.length - 1
                            ? themes.length % 2 != 0
                                ? ""
                                : al2
                            : al2
                    }${themeID == i ? "§o§1" : ""}§r§f${theme[1]} §7[${i == 67 ? "66 + 1" : i}]${theme.length > 3 && theme[3] ? `\n@${theme[3]}` : ``}`,
                    theme[2],
                    (player) => {
                        if(!overrideShit) {
                            doc.data.theme = themeIndex;
                            uiBuilder.db.overwriteDataByID(doc.id, doc.data);    
                            uiManager.open(player, "edit_cherry_theme", id, overrideShit, currTheme, showNegative1Btn);
                        } else {
                            overrideShit(themeIndex)
                        }
                    }
                );
            }
            form.show(player, false, (player, response) => {});
        } catch (e) {
            player.sendMessage(`Err: ${e}`);
        }
    }
);
