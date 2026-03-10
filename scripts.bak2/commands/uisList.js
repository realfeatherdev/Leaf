import commandManager from "../api/commands/commandManager";
import config from "../versionData";
import "./report";
import uiManager from "../uiManager";
import uiBuilder from "../api/uiBuilder";

commandManager.addCommand(
    "uis",
    {
        description: "View UIs in Leaf Essentials",
        author: "TrashyKitty",
        category: "Setup",
    },
    ({ msg, args }) => {
        let text = [];
        if(!args.includes('-l')) {
            text.push(`§8----------- §aLeaf GUIs §r§8-----------`);
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
        }
        let pUIs = uiBuilder.db.data.filter(_=>{
            if(_.data.scriptevent && typeof _.data.scriptevent == "string") return true;
            return false;
        })
        if(!args.includes('-p')) {
            text.push(``);
            text.push(`§8----------- §aPlayer GUIs §r§8-----------`)
            for(const ui of pUIs) {
                text.push(`§7- §f${ui.data.scriptevent} §2(${ui.data.internal ? "LEAF-EDIT" : "PLAYER"} UI)`)
            }
        }
        text.push(``);
        text.push(
            `§2You can open a UI by doing §f/leaf:open §a<player> §e<ui_id>`
        );
        text.push(
            `§2Example: the ui §epay §r§2would be §a/leaf:open @s "pay"`
        );
        text.push(`§eTIP: Quotes are not required, as long as the ID doesnt have spaces or special characters`)
        text.push(``)
        text.push(`§2Use §e!uis -p §2or §e!uis -l §2to exclude specific gui types §b(p = player, l = leaf)`)
        text.push(``)
        text.push(`${uiManager.uis.length} Builtin UI(s)`)
        text.push(`${pUIs.length} Player UI(s)`)
        text.push(`${uiManager.uis.length + pUIs.length} Total UI(s)`)
        msg.sender.sendMessage(text.join("\n§r"));
    }
);
