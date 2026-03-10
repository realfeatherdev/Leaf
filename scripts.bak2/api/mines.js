import { system } from "@minecraft/server";
import { normalizePercentages, weightedRandomIndex } from "./commonFunctions";
import uiBuilder from "./uiBuilder";

class Mines {
    constructor() {
        this.CUSTOMIZER_TYPE = 19;
        this.startHandler()
    }
    startHandler() {
        system.runInterval(()=>{
            for(const mine of uiBuilder.db.findDocuments({type: this.CUSTOMIZER_TYPE})) {
                if(Date.now() >= mine.data.nextRefill) {
                    mine.data.nextRefill = Date.now() + mine.data.refillTimeMS;
                    uiBuilder.db.overwriteDataByID(mine.id, mine.data);
                    this.refill(mine);
                }
            }
        },20);
    }
    refill(mine) {
        
    }
    /**
    @param {any[][]} choices
    **/
    random(choices) {
        let percentages = normalizePercentages(choices.map(_=>_[0]));
        let values = choices.map(_=>_[1]);
        return values[weightedRandomIndex(percentages)];
    }
}