// Added in v0.1
// Updated a lot
import translation from "../../api/translation";
import uiBuilder from "../../api/uiBuilder";
import config from "../../versionData";
import { ModalForm } from "../../lib/form_func";
import uiManager from "../../uiManager";
import { NUT_UI_MODAL } from "../preset_browser/nutUIConsts";
import versionData from "../../versionData";
import { minesAPI } from "../../api/mines";
import zones from "../../api/zones";
import { BlockTypes } from "@minecraft/server";
// hey daddy i wanna turn myself into a vegetable
uiManager.addUI(
    config.uiNames.UIBuilderAdd,
    "Add a UI",
    (
        player,
        defaultTitle = undefined,
        defaultBody = undefined,
        defaultScriptevent = undefined,
        error = undefined,
        id = undefined,
        folder = undefined
    ) => {
        if (id == 1719775088275) return;
        let modalForm = new ModalForm();
        modalForm.title(
            `${NUT_UI_MODAL}${
                    id
                    ? "Edit UI"
                    : translation.getTranslation(player, "uibuilder.createui")
            }`
        );
        let labelCount = error ? 1 : 0;
        if(error) modalForm.label(`§c§lERROR §8>> §r§7${error}`);
        modalForm.textField(
            `${translation.getTranslation(player, "uibuilder.title")}§c*`,
            translation.getTranslation(player, "uibuilder.titleplaceholder"),
            defaultTitle
        );
        modalForm.textField(
            translation.getTranslation(player, "uibuilder.body"),
            translation.getTranslation(player, "uibuilder.bodyplaceholder"),
            defaultBody
        );
        // if(id) {
        //     if(uiBuilder.validateUniqueID(defaultScriptevent)) {
        //         modalForm.label(`§dYou can open this UI using §e/scriptevent leaf:open ${defaultScriptevent}`)
        //     }
        // }
        modalForm.textField(
            `${translation.getTranslation(player, "uibuilder.scriptevent")}§c*`,
            `example-ui`,
            defaultScriptevent,
            () => {},
            "A unique ID is what is used to open your UI. We recommend not having spaces. To open, do: §e/scriptevent leaf:open §aunique-id§f."
        );
        let ui2;
        if (id) {
            ui2 = uiBuilder.db.getByID(id);
        }
        modalForm.textField(
            `After Cancel Action`,
            "Command to run if player closes UI",
            ui2 ? (ui2.data.cancel ? ui2.data.cancel : "") : "",
            ()=>{},
            "Run this command if the player closes the UI without clicking anything"
        );
        modalForm.dropdown(
            `UI Layout`,
            [
                {
                    option: "§eNormal",
                    callback() {},
                },
                {
                    option: "§6Grid UI",
                    callback() {},
                },
                {
                    option: "§uFullscreen UI",
                    callback() {},
                },
                {
                    option: "§dNormal (with player model)",
                    callback() {},
                },
                {
                    option: "§cCherryUI (Recommended)",
                    callback() {},
                },
                {
                    option: "§4Dropdown",
                    callback() {},
                },
            ],
            ui2 ? (ui2.data.layout ? ui2.data.layout : 0) : 4
        );
        modalForm.divider();
        // modalForm.toggle("Use2 simplified UI builder", ui2 && ui2.data.simplify ? true : false)
        modalForm.submitButton(
            id
                ? "Edit UI"
                : translation.getTranslation(player, "uibuilder.createui")
        );
        modalForm.show(player, false, (player, response2) => {
            let response = {
                formValues: response2.formValues
            }
            response.formValues.splice(0, labelCount)
            if(response.canceled) {
                if(folder) return uiManager.open(player, config.uiNames.UIBuilderFolder, folder);
                if(id) return uiManager.open(player, config.uiNames.UIBuilderEdit, id)
                return uiManager.open(player, config.uiNames.UIBuilderRoot)
            }
            if(!uiBuilder.validateUniqueID(response.formValues[2])) {
                return uiManager.open(
                    player,
                    config.uiNames.UIBuilderAdd,
                    response.formValues[0],
                    response.formValues[1],
                    response.formValues[2],
                    "Invalid scriptevent name! Valid characters: 0-9 A-Z a-z , . _ - /",
                    folder
                );
            }
            if(!id && uiBuilder.db.findFirst({type: 0, scriptevent: uiBuilder.validateUniqueID(response.formValues[2])})) {
                return uiManager.open(
                    player,
                    config.uiNames.UIBuilderAdd,
                    response.formValues[0],
                    response.formValues[1],
                    response.formValues[2],
                    "Theres already a UI using this scriptevent!",
                    folder
                );
            }
            if (!response.formValues[0])
                return uiManager.open(
                    player,
                    config.uiNames.UIBuilderAdd,
                    response.formValues[0],
                    response.formValues[1],
                    uiBuilder.validateUniqueID(response.formValues[2]),
                    translation.getTranslation(
                        player,
                        "uibuilder.errors.titleundefined"
                    ),
                    folder
                );
            if (!response.formValues[2])
                return uiManager.open(
                    player,
                    config.uiNames.UIBuilderAdd,
                    response.formValues[0],
                    response.formValues[1],
                    uiBuilder.validateUniqueID(response.formValues[2]),
                    translation.getTranslation(
                        player,
                        "uibuilder.errors.scripteventundefined"
                    ),
                    folder
                );
            if (id) {
                let ui = uiBuilder.db.getByID(id);
                if (!ui) return;
                ui.data.name = response.formValues[0];
                ui.data.body = response.formValues[1];
                ui.data.scriptevent = uiBuilder.validateUniqueID(response.formValues[2]);
                ui.data.cancel = response.formValues[3];
                ui.data.layout = response.formValues[4];
                // ui.data.simplify = response.formValues[5];
                uiBuilder.db.overwriteDataByID(id, ui.data);
                uiManager.open(player, config.uiNames.UIBuilderEdit, id);
                return;
            }
            let NEWID = uiBuilder.createUI(
                response.formValues[0],
                response.formValues[1],
                "normal",
                uiBuilder.validateUniqueID(response.formValues[2]),
                response.formValues[4],
                {
                    cancel: response.formValues[3],
                    folder: folder ? folder : null,
                    theme: 68
                    // simplify: response.formValues[5]
                }
            );
            uiManager.open(player, config.uiNames.UIBuilderEdit, NEWID);
            // if(folder) return uiManager.open(player, config.uiNames.UIBuilderFolder, folder);
            // uiManager.open(player, config.uiNames.UIBuilderRoot);
        });
    }
);
const MS_IN_TICKS = 5;
function nan0(str, d) {
    let num = parseInt(str);
    if(isNaN(num)) return d;
    return num;
}
uiManager.addUI(versionData.uiNames.MinesAdd, "add a mine", (player, id = -1)=>{
    let mine = id != -1 ? uiBuilder.db.getByID(id) : null;
    if(mine && mine.data.type != minesAPI.CUSTOMIZER_TYPE) return;
    let modal = new ModalForm();
    modal.title("New Mine")
    modal.textField("Unique ID", "type a unique id for this mine", mine ? mine.data.uniqueID : "")
    // modal.textField("Refill Time", "type a unique id for this mine", mine ? mine.data.uniqueID : "")
    modal.textField("Refill Time (Minutes)", "Type a refill time for this mine", mine ? mine.data.refillTimeMS ? Math.floor(mine.data.refillTimeMS / 60000).toString() : "1" : "1");
    let zonesList = zones.getZones();
    if(!zonesList.length) {
        player.error("You need a reference zone to make a mine!");
        return uiManager.open(player, versionData.uiNames.UIBuilderRoot)
    }
    modal.dropdown("Reference Zone", zonesList.map(_=>{
        return {
            option: _.data.name,
            callback() {}
        }
    }), mine ? mine.data.zoneID ? Math.max(zonesList.findIndex(_=>_.id == mine.data.zoneID), 0) : 0 : 0)
    modal.textField("Block Types", "e.x. minecraft:stone,minecraft:dirt", mine ? mine.data.blockTypeIDs.map(_=>_.startsWith('minecraft:') ? _.replace('minecraft:', '') : _).join(',') : "")
    modal.textField("Chances", "e.x. 90,10", mine ? mine.data.chances.map(_=>_.toString()).join(',') : "")
    modal.show(player, false, (player, response)=>{
        if(response.canceled) return;
        let chances = response.formValues[4].split(',').map(chance=>{
            return nan0(chance.trim(), 1)
        })
        let blocks = response.formValues[3].split(',').map(blockTypeID2=>{
            let blockTypeID = blockTypeID2.trim()
            return BlockTypes.get(blockTypeID) ? blockTypeID.split(':').length > 1 ? blockTypeID : `minecraft:${blockTypeID}` : "minecraft:stone"
        });
        if(chances.length < blocks.length) {
            while(chances.length < blocks.length) {
                chances.push(1)
            }
        } else if(chances.length > blocks.length) {
            while(chances.length > blocks.length) {
                chances.pop()
            }
        }
        if(mine) {
            let otherMine = uiBuilder.db.findFirst({type: minesAPI.CUSTOMIZER_TYPE, uniqueID: response.formValues[0]})
            if(otherMine && otherMine.id != mine.id) {
                player.error("Did not change id, it is already used")
            } else {
                mine.data.uniqueID = response.formValues[0]
            }
            mine.data.refillTimeMS = Math.floor(nan0(response.formValues[1], 1) * 60000)
            mine.data.zoneID = zonesList[response.formValues[2]].id
            mine.data.blockTypeIDs = blocks
            mine.data.chances = chances;
            uiManager.open(player, versionData.uiNames.UIBuilderEdit, id);
        } else {
            let id = uiBuilder.createMine(
                response.formValues[0],
                Math.floor(nan0(response.formValues[1], 1) * 60000),
                zonesList[response.formValues[2]].id,
                blocks,
                chances
                
            )
            uiManager.open(player, versionData.uiNames.UIBuilderEdit, id);
        }
    })
    // modal.slider("Refill Time (seconds)")
})