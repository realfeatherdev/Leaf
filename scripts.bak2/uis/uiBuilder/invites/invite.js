import { system, world } from "@minecraft/server";
import { ModalForm } from "../../../lib/form_func";
import versionData from "../../../versionData";
import uiBuilder from "../../../api/uiBuilder";
import actionParser from "../../../api/actionParser";
import configAPI from "../../../api/config/configAPI";
import { formatStr } from "../../../api/azaleaFormatting";
import uiManager from "../../../uiManager";

configAPI.registerProperty("TPRWait", configAPI.Types.Boolean, true);
configAPI.registerProperty("TPRWaitCooldown", configAPI.Types.Number, 10);
configAPI.registerProperty("TPRCooldownFormat", configAPI.Types.String, "§b§lTPR §8>> §7Wait for <s> more seconds!");

export function playerWaitWithoutMoving(player, time, format, cb) {
    let initialLoc = {x: player.location.x, y: player.location.y, z: player.location.z}
    let timeLeft = time;
    // console.warn(time)
    let interval = system.runInterval((e)=>{
        if(!player.isValid) return system.clearRun(interval);
        if(time > 0 && timeLeft != time && (player.location.x != initialLoc.x || player.location.y != initialLoc.y || player.location.z != initialLoc.z)) {
            system.clearRun(interval)
            player.error("You moved!")
            player.playSound("random.glass")
            return;
        }
        if(timeLeft == 0) {
            system.clearRun(interval)
            cb();
            return;
        }
        if(
            (timeLeft >= 4 && timeLeft <= 20 && timeLeft % 5 == 0) ||
            (timeLeft <= 3) ||
            (timeLeft > 20 && timeLeft % 10 == 0) ||
            (timeLeft == time)
        ) player.sendMessage(formatStr(format, player, {r: `${timeLeft}`, rt: `${time}`}))
        timeLeft--;
    }, 20)
}

system.afterEvents.scriptEventReceive.subscribe(e=>{
    if(e.id == "leaf:wait_test_000") {
        playerWaitWithoutMoving(e.sourceEntity, 15, "<s> left", ()=>{
            e.sourceEntity.sendMessage("Done!")
        })
    }
    if(e.id == "leaf:wait") {
        return e.sourceEntity.sendMessage("WIP")
        let cooldown = parseInt(e.message.split(' ')[0]);
        let command = e.message.split(' ').slice(1).join(' ');
        if(e.sourceEntity && e.sourceEntity.typeId == "minecraft:player") {
            playerWaitWithoutMoving(e.sourceEntity, cooldown, ()=>{
                actionParser.runAction(e.sourceEntity, command)
            });
        }
    }
})

// await system.waitTicks(3)

// const { default: uiManager } = await import("");

uiManager.addUI(
    versionData.uiNames.InviteManager.Invite,
    "",
    (player, invite_name, leaveAction) => {
        let modalForm = new ModalForm();
        let players = world.getPlayers().filter((_) => {
            return _.id != player.id;
        });
        if (!players.length) {
            player.error("No players to choose from!");
            if(leaveAction) return actionParser.runAction(player, leaveAction);
        }
        modalForm.dropdown(
            "Select a player",
            players.map((_) => {
                return {
                    option: _.name,
                    callback() {},
                };
            })
        );
        modalForm.show(player, false, (player, response) => {
            if (response.canceled)
                return actionParser.runAction(player, leaveAction);
            uiBuilder.inviteCMD(
                {},
                "send",
                invite_name,
                player,
                players[response.formValues[0]]
            );
            if(leaveAction) return actionParser.runAction(player, leaveAction);
        });
    }
);
