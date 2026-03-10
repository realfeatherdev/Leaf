// what the flipple?

import { ScriptEventSource, system, world } from "@minecraft/server";
import { prismarineDb } from "../lib/prismarinedb";
import { SegmentedStoragePrismarine } from "../prismarineDbStorages/segmented";
import uiBuilder from "./uiBuilder";
import actionParser from "./actionParser";
import { formatStr } from "./azaleaFormatting";
// kospri les sex 0
 // ermmm?

export class Flibblejaggle {
    constructor() {
        // No flibanians? :O
        this.flibanians = [];
        this.flibania = {};
    }

    // DADYY!!!!!!!!!!! ^w^
    daddyFlibanian() {
        // oh. hes a flibanian
        // flibby jibby kibby wibble

        // TODO: Implement jinklejorkle and sninklesnorkle
        // les se plal plagu tinkleonmydinkle

        /*
            ABOUT FLOOPIMORPHY
            tinkedink wow im a twink OwO
            jinglejiggle  leaky leaky piss
            fick.

            nile river
        */

        let clippleClapple = 1; // define the pork


        let flioOOOOOPPPPPPPPP = 12; // define the pram

        return clippleClapple * flioOOOOOPPPPPPPPP * Math.PI; // The resulted piss trajectory! Helik Blipple!

        prismarineDb.cream(); // o no.

        // unrachalble
    }
}
// if ya jim then ya jom, thats just how flippying is!
// FLOOOOOOOOOOPPPPPPPPPYHIMYRPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPppP
// ??????????????????????????????
// eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee (tinitus moment)
class FloopimorphyCore {
    constructor() {
        // da talbse
        this.db = prismarineDb.customStorage("Floopimorphy", SegmentedStoragePrismarine)
    }
}
// flatter than me. what the hell.
export default new FloopimorphyCore();

// oh god. flippy glippy jim whippy

// wow

// the seuqle

// the scpripttevenTTTTTTTTTTTt

// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// world.sendMessage("FLOOPIMORPHY")
system.afterEvents.scriptEventReceive.subscribe(e=>{
    if(e.id == "leaf:function") {
        let isEntity = e.sourceType == ScriptEventSource.Entity;
        let funtcion = uiBuilder.db.findFirst({type: 16, uniqueID: e.message});
        if(funtcion) {
            let code = uiBuilder.base64Decode(funtcion.data.code).split('\n');
            let formatting = true;
            for(const line of code) {
                if(line.trim() == '' || line.trim().startsWith('//') || line.includes("SIX SEVEN")) continue; // fuck you brainrotted individuals
                if(line.toLowerCase() == '#disable_formatting') formatting = false;
                if(line.toLowerCase() == '#enable_formatting') formatting = true;
                if(["#disable_formatting", "#enable_formatting"].includes(line.toLowerCase())) continue;
                if(isEntity) {
                    actionParser.runAction(e.sourceEntity, formatting ? formatStr(line.trim(), e.sourceEntity) : line.trim())
                } else {
                    world.getDimension('overworld').runCommand(line.trim().startsWith('/') ? line.trim().replace('/', '') : line.trim())
                }
            }
        }
    }
})