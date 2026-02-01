import { system, world } from "@minecraft/server"
import commandManager from "../../api/commands/commandManager"
import uiBuilder from "../../api/uiBuilder"
import actionParser from "../../api/actionParser"
import normalForm from "../../api/openers/normalForm"
import { formatStr } from "../../api/azaleaFormatting"
// import { playerWaitWithoutMoving } from ""
let playerWaitWithoutMoving;

await system.waitTicks(0)

system.runTimeout(async ()=>{
    const mod = await import("../uiBuilder/invites/invite")
    playerWaitWithoutMoving = mod.playerWaitWithoutMoving;
},4)
function runActions(player, actions, extravars = {}, formatcfg = {}) {
    // world.sendMessage(JSON.stringify(actions, null, 4))
    for(let action of actions) {
        if(typeof action === "string" || action.type == 0) {
            let action2 = formatStr(
                typeof action === "string" ? action : action.action,
                formatcfg.swap ? formatcfg.player2 : player,
                extravars,
                {...formatcfg, player2: formatcfg.player2 ? formatcfg.swap ? player : formatcfg.player2 : null}
            );
            try {
                if(formatcfg.extraFn) action = formatcfg.extraFn()
            } catch {}
            // world.sendMessage(action ? JSON.stringify(action) : "meow")
            actionParser.runAction(player, action2)
        } else if(action.type == 1) {
            if(normalForm.playerIsAllowed(player, action.condition)) {
                if(action.waitTime) {
                    playerWaitWithoutMoving(player, action.waitTime, action.waitFormat ? action.waitFormat : "§d§lWAIT §r§8>> §7Stand still for <r> seconds!", ()=>{
                        runActions(player, action.actions, extravars, formatcfg)
                    })
                } else {
                    runActions(player, action.actions, extravars, formatcfg)
                }
                if(action.stopExec) break;
            }
        }
    }
}

export function handleActions(player, actions, ensureChatClosed = false, extravars = {}, formatcfg = {}, execother = false, noself = false, args = []) {
    let extravars2 = {}
    let formatcfg2 = {}
    if(execother) {
        let playerName = args.join(' ').toLowerCase()
        playerName = playerName.replace('@', '')
        playerName = playerName.startsWith('"') && playerName.endsWith('"') ? playerName.substring(1).slice(0,-1) : playerName; // <------ actual fucking spaghetti please fix someone please
        // world.sendMessage(playerName)
        if(playerName.startsWith('"') && playerName.endsWith('"')) playerName = playerName.substring(1).slice(0,-1)
        let p = null;
        for(const player of world.getPlayers()) {
            if(player.name.toLowerCase() == playerName) p = player;
        }
        if(!p) return player.error("Player not found :(")
        if(p && p.name == player.name && noself) return player.error("You can't execute this command on yourself")
        formatcfg2.player2 = p;
    }
    if(!ensureChatClosed) {
        runActions(player, actions, {...extravars, ...extravars2}, {...formatcfg, ...formatcfg2})
    } else {
        let loc = { x: player.location.x, y: player.location.y, z: player.location.z }
        player.success("Close chat and move to run this command.")
        let steps = 0;
        let run = system.runInterval(()=>{
            steps++;
            if(steps > 10) system.clearRun(run)
            if(player.location.x != loc.x || player.location.y != loc.y || player.location.z != loc.z) {
                runActions(player, actions, {...extravars, ...extravars2}, {...formatcfg, ...formatcfg2})
                return system.clearRun(run)
            }
        },5)
    }
}

export function reRegisterCommands() {
    for(const doc of uiBuilder.db.findDocuments({type: 9})) {
        // world.sendMessage(`Registering ${doc.data.command}`)
        try {
            commandManager.removeCmd(doc.data.command);

        } catch{}
        if(commandManager.cmds.findFirst({name: doc.data.command})) return;
        commandManager.addCommand(doc.data.command, {description: doc.data.description, category: doc.data.category}, ({msg, args})=>{
            handleActions(msg.sender, doc.data.actions, doc.data.ensureChatClosed, {}, {}, doc.data.execother, doc.data.noself, args)
        })
        for(const subcommand of doc.data.subcommands) {
            commandManager.addSubcommand(doc.data.command, subcommand.name, {description: subcommand.description ? subcommand.description : "No Description"}, ({msg, args})=>{
                handleActions(msg.sender, subcommand.actions, subcommand.ensureChatClosed, {}, {}, subcommand.execother, subcommand.noself, args)
            })
        }
    }
}

export function initiallyLoadCommands() {
    uiBuilder.db.waitLoad().then(()=>{
        reRegisterCommands()
    })
}