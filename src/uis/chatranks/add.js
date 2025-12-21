import ranks from "../../api/ranks";
import { ModalForm } from "../../lib/form_func";
import { colors, prismarineDb } from "../../lib/prismarinedb";
import uiManager from "../../uiManager";
import versionData from "../../versionData";
import { NUT_UI_MODAL } from "../preset_browser/nutUIConsts";

uiManager.addUI(
    versionData.uiNames.ChatRanks.Ranks.AddRank,
    "ioufehjw9",
    (player, tag = "") => {
        let modalForm = new ModalForm();
        modalForm.title(
            `${NUT_UI_MODAL}${tag ? "Editing Rank" : "Creating Rank"}`
        );
        // ranks.createRank(tag, name, nameColor, bracketColor, messageColor, priority)
        let opts = [
            {
                colorCode: "default",
                display: "Default",
            },
            ...colors.getColorNamesColored().map((_) => {
                return {
                    colorCode: _.slice(0, 2),
                    display: _,
                };
            }),
        ];

        let rank = ranks.getRank(tag);

        let nameColorIndex = Math.max(
            rank ? opts.findIndex((_) => _.colorCode == rank.nameColor) : 0,
            0
        );
        let bracketColorIndex = Math.max(
            rank ? opts.findIndex((_) => _.colorCode == rank.bracketColor) : 0,
            0
        );
        let messageColorIndex = Math.max(
            rank ? opts.findIndex((_) => _.colorCode == rank.messageColor) : 0,
            0
        );
        let dropdownOpts = opts.map((_) => {
            return {
                option: _.display,
                callback() {},
            };
        });
        modalForm.textField(
            "Rank Tag",
            "Tag to give player the rank",
            rank ? rank.tag : undefined
        );
        modalForm.textField(
            "Rank Name",
            "Display of the rank",
            rank ? rank.name : undefined
        );
        modalForm.slider("Priority", 1, 30, 1, rank ? rank.priority : 1);
        modalForm.dropdown("Name Color", dropdownOpts, nameColorIndex);
        modalForm.dropdown("Bracket Color", dropdownOpts, bracketColorIndex);
        modalForm.dropdown("Message Color", dropdownOpts, messageColorIndex);
        modalForm.textField("Hide with Tags (optional)", "...", rank && rank.hideWithTags ? rank.hideWithTags.join(', ') : "", ()=>{}, "Hide this rank when any of these tags are on the player")
        modalForm.toggle("Hide rank in chat?", rank && rank.hideInChat ? rank.hideInChat : false, ()=>{}, "The absolute most useless toggle!")
        modalForm.show(player, false, (player, response) => {
            if (!response.formValues[0] && tag) {
                ranks.deleteRank(tag);
            }
            if (!response.formValues[1])
                return uiManager.open(
                    player,
                    versionData.uiNames.ChatRanks.Ranks.Edit
                );
            ranks.createRank(
                response.formValues[0],
                response.formValues[1],
                opts[response.formValues[3]].colorCode,
                opts[response.formValues[4]].colorCode,
                opts[response.formValues[5]].colorCode,
                response.formValues[2],
                response.formValues[6].split(',').map(_=>_.trim()).filter(_=>_.length > 0),
                response.formValues[7]
            );
            uiManager.open(player, versionData.uiNames.ChatRanks.Ranks.Edit);
        });
    }
);
