import config from "../../versionData";
import uiManager from "../../uiManager";
import {
    NUT_UI_HEADER_BUTTON,
    NUT_UI_TAG,
} from "../preset_browser/nutUIConsts.js";
import homes from "../../api/homes";
import { ActionForm } from "../../lib/form_func";
import icons from "../../api/icons.js";
import playerStorage from "../../api/playerStorage.js";

uiManager.addUI(config.uiNames.Homes.Shared, "Homes Root", (player) => {
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§r§f` + "Homes");
    form.button(
        `${NUT_UI_HEADER_BUTTON}§cBack\n§7Go back to homes root`,
        "textures/azalea_icons/2.png",
        (player) => {
            uiManager.open(player, config.uiNames.Homes.Root);
        }
    );
    for (const home of homes.getSharedHomes(player)) {
        form.button(`§6${home.data.name}\n§7Owner: ${playerStorage.getPlayerByID(home.data.owner).name}`, home.data.icon ? icons.resolve(home.data.icon) ?? "textures/azalea_icons/icontextures/tile2_004" : "textures/azalea_icons/icontextures/tile2_004", (player) => {
            uiManager.open(player, config.uiNames.Homes.View, home.id);
        });
    }
    form.show(player);
});
