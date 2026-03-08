import config from "../../versionData.js";
import uiManager from "../../uiManager";
import homes from "../../api/homes";
import "./create";
import "./view";
import "./config.js";
import "./viewShared";
import "./shared.js";
import { ActionForm } from "../../lib/form_func.js";
import { NUT_UI_DISABLE_VERTICAL_SIZE_KEY, NUT_UI_LEFT_HALF, NUT_UI_RIGHT_HALF, NUT_UI_TAG } from "../preset_browser/nutUIConsts.js";
import icons from "../../api/icons.js";
import { insertBackButton } from "../sharedUtils/insertBackButton.js";
import configAPI from "../../api/config/configAPI.js";
import playerStorage from "../../api/playerStorage.js";

uiManager.addUI(
    config.uiNames.Homes.Root,
    "Homes Root",
    (player, backButton) => {
        let form = new ActionForm();
        form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§fHomes`);
        insertBackButton(form, backButton);
        form.button(
            `${!configAPI.getProperty("AzaleaStyleSharedHomes") ? `` : ``}§r§bCreate Home\n§7Create a home`,
            "textures/azalea_icons/icontextures/tile2_022",
            (player) => {
                uiManager.open(player, config.uiNames.Homes.Create);
            }
        );
        if (!configAPI.getProperty("AzaleaStyleSharedHomes")) {
            form.button(
                `§6Shared Homes\n§7View homes shared to you`,
                // null,
                icons.resolve("^textures/azalea_icons/icontextures/tile2_021"),
                (player) => {
                    uiManager.open(player, config.uiNames.Homes.Shared);
                }
            );
        }
        form.divider();
        for (const home of homes.getAllFromPlayer(player)) {
            form.button(
                `§2${home.data.name}\n§7[ Click to view home ]`,
                home.data.icon ? icons.resolve(home.data.icon) ?? "textures/azalea_icons/icontextures/tile2_004" : "textures/azalea_icons/icontextures/tile2_004",
                (player) => {
                    uiManager.open(player, config.uiNames.Homes.View, home.id);
                }
            );
        }
        form.show(player);
    }
);
