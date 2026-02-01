import { pluginsLoaded } from "../pluginStorage";

export class Clock {
    constructor() {
        this.name = "Clock";
        this.displayName = "Clock";
        this.id = "clock";
        this.description = "Leafs tick handling!";
        this.enabledByDefault = true;
        this.icon = "textures/items/clock_item";
        this.tick = 0;
        this.tickIntervals = [
            {
                fn: ()=> {
                    this.tick++;
                },
                timeout: 1
            }
        ]
    }

    load() {}
    unload() {}
}