var EntityPersistentStorage = class {
    constructor(entity) {
        this.entity = entity;
    }
    load(table) {
        let val = ``;
        try {
            val = this.entity.getDynamicProperty(
                `prismarine:${table}`
            );
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
            this.entity.setDynamicProperty(
                `prismarine:${table}`,
                JSON.stringify(data)
            );
        });
    }
};