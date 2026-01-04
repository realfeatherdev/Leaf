import { Player, system, world } from "@minecraft/server";
import { formatStr } from "./api/azaleaFormatting";
import configAPI from "./api/config/configAPI";
import { leafFormatter } from "./api/formatting";

export function createMessage(player, msg) {
    // if(msg.includes("boom")) {
    //     system.run(()=>{
    //         player.applyKnockback(0, 0, 0, 30)
    //     })
    // }
    if (configAPI.getProperty("ExperimentalChatRankFormatting")) {
        // world.sendMessage(
        //     leafFormatter.format(configAPI.getProperty("chatformat"), {
        //         msg: `${msg}`,
        //         player: player,
        //     })
        // ); fuck this shi
    } else {
        return formatStr(configAPI.getProperty("chatformat"), player, {
            msg: msg.replaceAll('<msg>','<blocked>'),
            rc: "§7",
        }).replaceAll("%", "%%")
    }

    // configAPI.getProperty("chatformat"),
}
