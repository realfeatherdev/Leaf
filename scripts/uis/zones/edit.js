import { world } from "@minecraft/server";
import zones from "../../api/zones";
import { ActionForm } from "../../lib/form_func";
import uiManager from "../../uiManager";
import versionData from "../../versionData";
import {
    NUT_UI_DISABLE_VERTICAL_SIZE_KEY,
    NUT_UI_HEADER_BUTTON,
    NUT_UI_LEFT_HALF,
    NUT_UI_RIGHT_HALF,
    NUT_UI_TAG,
} from "../preset_browser/nutUIConsts";
import uiBuilder from "../../api/uiBuilder";
function getCuboidCenter(pos1, pos2) {
    return {
        x: (pos1.x + pos2.x) / 2,
        y: (pos1.y + pos2.y) / 2,
        z: (pos1.z + pos2.z) / 2,
    };
}
uiManager.addUI(versionData.uiNames.Zones.Edit, "A", (player, id) => {
    let zone = uiBuilder.db.getByID(id);
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}§rEdit Zone: ${zone.data.name}`);
    form.button(
        `${NUT_UI_HEADER_BUTTON}§r§cBack`,
        `textures/azalea_icons/2`,
        (player) => {
            uiManager.open(player, zone.data.folder && uiBuilder.db.getByID(zone.data.folder) ? versionData.uiNames.UIBuilderFolder : versionData.uiNames.UIBuilderRoot, zone.data.folder);
        }
    );
    form.button(
        `§eEdit Properites\n§7Edit area and priority`,
        null,
        (player) => {
            uiManager.open(player, versionData.uiNames.Zones.Add, id);
        }
    );
    form.button(`§dEdit Flags\n§7Edit this zones flags`, null, (player) => {
        uiManager.open(player, versionData.uiNames.Zones.EditFlags, id);
    });
    form.button(
        `§cDelete\n§7Delete this zone`,
        `textures/azalea_icons/Delete`,
        (player) => {
            uiManager.open(
                player,
                versionData.uiNames.Basic.Confirmation,
                "Are you sure you want to delete this zone?",
                () => {
                    uiBuilder.db.deleteDocumentByID(id);
                    uiManager.open(player, zone.data.folder && uiBuilder.db.getByID(zone.data.folder) ? versionData.uiNames.UIBuilderFolder : versionData.uiNames.UIBuilderRoot, zone.data.folder);
                },
                () => {
                    uiManager.open(player, versionData.uiNames.Zones.Edit, id);
                }
            );
        }
    );
    form.button(`§2On Enter Actions`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.CustomCommandsV2.editActions, zone.data.enter && Array.isArray(zone.data.enter) ? zone.data.enter : [], (actions)=>{
            zone.data.enter = actions;
            uiBuilder.db.overwriteDataByID(zone.id, zone.data)
            uiManager.open(player, versionData.uiNames.Zones.Edit, id)
        })
    })
    form.button(`§2On Exit Actions`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.CustomCommandsV2.editActions, zone.data.exit && Array.isArray(zone.data.exit) ? zone.data.exit : [], (actions)=>{
            zone.data.exit = actions;
            uiBuilder.db.overwriteDataByID(zone.id, zone.data)
            uiManager.open(player, versionData.uiNames.Zones.Edit, id)
        })
    })

    form.divider();
    form.label("Teleport to")
    form.button(`${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§rPos1`, null, (player)=>{
        player.teleport({
            x: zone.data.x1,
            y: zone.data.y1,
            z: zone.data.z1,
        })
    })
    form.button(`${NUT_UI_LEFT_HALF}§rPos2`, null, (player)=>{
        player.teleport({
            x: zone.data.x2,
            y: zone.data.y2,
            z: zone.data.z2,
        })
    })
    form.button(`§rCenter`, null, (player)=>{
        let center = getCuboidCenter({
            x: zone.data.x1,
            y: zone.data.y1,
            z: zone.data.z1,
        }, {
            x: zone.data.x2,
            y: zone.data.y2,
            z: zone.data.z2,
        })
        player.teleport(center)
    })
    form.show(player, false, (player, response) => {});
});