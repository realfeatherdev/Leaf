import { world } from '@minecraft/server'
// very legacy. not recommended.
var WorldPersistentStorage = class {
    constructor() {
        this.name = "WORLD_PERSISTENT";
        this.trashable = true;
    }
    load(table) {
        let val = ``;
        try {
            val = world.getDynamicProperty(`prismarine:${table}`);
        } catch {
            val = ``;
        }
        if (!val) val = `[]`;
        let data = [];
        try {
            data = JSON.parse(val);
        } catch {
            data = [];
        }
        return data;
    }
    save(table, data) {
        system.run(() => {
            world.setDynamicProperty(
                `prismarine:${table}`,
                JSON.stringify(data)
            );
        });
    }
};