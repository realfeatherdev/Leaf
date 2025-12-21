import commandManager from "../api/commands/commandManager";
import config from "../versionData";
import "./report";
import uiManager from "../uiManager";

commandManager.addCommand(
    "uis",
    {
        description: "View UIs in Leaf Essentials",
        author: "TrashyKitty",
        category: "Setup",
    },
    ({ msg }) => {
        let text = [];
        text.push(`§8----------- §aList §r§8-----------`);
        for (const ui of uiManager.uis.sort((a, b) => {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        })) {
            text.push(
                `§e${ui.id} §r§7${
                    ui.description ? ui.description : "No Description"
                }`
            );
        }
        text.push(``);
        text.push(
            `§2You can open a UI by doing §f/scriptevent ${config.scripteventNames.openDefault}§eui_id`
        );
        text.push(
            `§2Example: the ui §epay §r§2would be §a/scriptevent §bleafgui:§epay`
        );
        text.push(``)
        text.push(`${uiManager.uis.length} UI(s)`)
        msg.sender.sendMessage(text.join("\n§r"));
    }
);
