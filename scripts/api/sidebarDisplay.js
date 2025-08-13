import { sidebarConfig } from "../configs";
import sidebarEditor from "./sidebarEditor";
import { system, world } from "@minecraft/server";
import configAPI from "./config/configAPI";

configAPI.registerProperty("Sidebar", configAPI.Types.Boolean, false);
let defaultSidebarName = "default";

system.runTimeout(async ()=>{
    const uiBuilder2 = await import( "./uiBuilder");
    let uiBuilder = uiBuilder2.default
    uiBuilder.db.waitLoad().then(()=>{
        defaultSidebarName = uiBuilder.db.findFirst({ isDefaultSidebar: true, type: 7 })
            ?.data.name || sidebarEditor.getSidebarNames()[0]
    
        uiBuilder.db.onUpdate((id, data)=>{
            defaultSidebarName = uiBuilder.db.findFirst({ isDefaultSidebar: true, type: 7 })
                ?.data.name || sidebarEditor.getSidebarNames()[0]
        })
    })
},20)
system.runInterval(() => {
    if (!configAPI.getProperty("Sidebar")) return;
    for (const player of world.getPlayers()) {
        try {
            if(!player.isValid) continue;
            if (player.hasTag("disable-sidebar")) {
                player.onScreenDisplay.setTitle("");
                continue;
            }
            let sidebarName = defaultSidebarName;
            let tag = player.getTags().find((_) => _.startsWith("sidebar:"));
            if (tag) sidebarName = tag.substring("sidebar:".length);
            try {
                let sidebar = sidebarEditor.parseEntireSidebar(
                    player,
                    sidebarName
                );
                if (sidebar != "@@LEAF_SIDEBAR_IGNORE")
                    player.onScreenDisplay.setTitle(`§r${sidebar}`);
            } catch (e) {
                console.error(e);
            }
        } catch {}
    }
}, 3);
