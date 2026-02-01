import { helpBaloon } from "../../api/helpButton";
import zones from "../../api/zones";
import { ActionForm } from "../../lib/form_func";
import uiManager from "../../uiManager";
import versionData from "../../versionData";
import {
    NUT_UI_HEADER_BUTTON,
    NUT_UI_TAG,
    NUT_UI_THEMED,
} from "../preset_browser/nutUIConsts";
import { themes } from "../uiBuilder/cherryThemes";

uiManager.addUI(versionData.uiNames.Zones.Root, "Zones Root", (player) => {
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[25][0]}§rZones`);
    form.button(
        `${NUT_UI_HEADER_BUTTON}§r§cBack`,
        `textures/azalea_icons/2`,
        (player) => {
            uiManager.open(player, versionData.uiNames.ConfigMain);
        }
    );
    form.button(
        `§aAdd Zone\n§7Create a zone`,
        `textures/azalea_icons/1`,
        (player) => {
            uiManager.open(player, versionData.uiNames.Zones.Add);
        }
    );
    helpBaloon(form, [
        "§a------- Zones -------",
        " ",
        "Zones allow you to set permissions in specific parts of your world!",
        " ",
        "To use:",
        "- Create one",
        "- Set flags",
        " ",
        "§a------- Blacklist/Whitelist -------",
        "To use the blacklist/whitelist, u need a compatible flag enabled and then edit it for that specific flag",
        " ",
        "§6* = wildcard, accepts all",
        " ",
        "If you add a *, it inverts everything from being a blacklist to a whitelist",
        " ",
        "Example:",
        "- *",
        "- pig",
        "- cow",
        " ",
        "This will catch EVERY mob/entity other than a pig and a cow"
    ], (player)=>{
        uiManager.open(player, versionData.uiNames.Zones.Root)
    })
    form.divider();
    for (const zone of zones.getZones()) {
        form.button(
            `§v${zone.data.name}\n§7Priority: ${zone.data.priority}`,
            null,
            (player) => {
                uiManager.open(player, versionData.uiNames.Zones.Edit, zone.id);
            }
        );
    }
    form.show(player, false, () => {});
});
