import { ScriptEventCommandMessageAfterEvent, ScriptEventSource, world } from "@minecraft/server";
import ScriptEventManager from "./ScriptEventManager";
import { normalizePercentages, weightedRandomIndex } from "../commonFunctions";
import warpAPI from "../warpAPI";

ScriptEventManager.register("leaf:switch_sidebar", ({ event }) => {
    if (event.sourceType != ScriptEventSource.Entity) return;
    for (const tag of event.sourceEntity.getTags()) {
        if (!tag.startsWith("sidebar:")) continue;
        event.sourceEntity.removeTag(tag);
    }
    if (event.message != "default")
        event.sourceEntity.addTag(`sidebar:${event.message}`);
});

function getVal(str) {
    let num = parseFloat(str)
    if(isNaN(num)) return 0;
    return num;
}

ScriptEventManager.register("leaf:weighted_rng", ({ event })=>{
    // if(!(event instanceof ScriptEventCommandMessageAfterEvent)) return;
    if (event.sourceType != ScriptEventSource.Entity) return;
    let args = event.message.split(' ');
    try {
        let scoreboard = args[0];
        if(!scoreboard) return;
        let args2 = args.slice(1);
        if(args2.length % 2 != 0) return;
        let percentages = [];
        let values = [];
        for (let i = 0; i < args2.length; i += 2) {
            const [perc, val] = [getVal(args2[i]), getVal(args2[i + 1])];
            percentages.push(perc)
            values.push(Math.floor(val))
        }
        let normalizedPercentages = normalizePercentages(percentages);
        let randomValue = values[weightedRandomIndex(normalizedPercentages)]
        let objective;
        try {
            objective = world.scoreboard.getObjective(scoreboard);
            if(!objective) objective = world.scoreboard.addObjective(scoreboard);
        } catch(e) {
            console.error(`${e}`)
        }
        objective.setScore(event.sourceEntity, randomValue)
    } catch(e) {
        console.error(`${e}`)

    }
})

ScriptEventManager.register("leaf:warpto", ({event})=>{
    // if(!(event instanceof ScriptEventCommandMessageAfterEvent)) return;
    if(event.sourceEntity && event.sourceEntity.typeId == "minecraft:player") {
        warpAPI.tpToWarp(event.sourceEntity, event.message)
    }
})