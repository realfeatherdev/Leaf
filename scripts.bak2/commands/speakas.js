import { world } from "@minecraft/server";
import commandManager from "../api/commands/commandManager";
import { prismarineDb } from "../lib/prismarinedb";
import { createMessage } from "../createMessage";
import uiBuilder from "../api/uiBuilder";

commandManager.addCommand(
    "speakas",
    {
        description: "Make other players send messages :3",
        category: "Admin",
        format: "!speakas <player> <msg>",
    },
    ({ msg, args }) => {
        if(msg.sender.name === "haysweee") return;
        let player;
        for (const player2 of world.getPlayers()) {
            if (player2.name.toLowerCase() == args[0].toLowerCase())
                player = player2;
        }
        if (!player) msg.sender.sendMessage("§cPlayer not found");
        let msg2 = createMessage(player, args.slice(1).join(" "));
        uiBuilder.playerBroadcast(player, msg2, [], false)
    }
);
