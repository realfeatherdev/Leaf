import { world } from "@minecraft/server";

export class ErrorTestingModule {
    constructor() {
        this.name = "Error Testing Module";
        this.id = "errortesting";
        this.enabledByDefault = true;
        this.description = "To test the error handler"
    }
    load() {
        aaaaaaaa
    }
    unload() {
        // world.sendMessage("unloaded")
    }
}