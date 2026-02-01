import { system, world } from "@minecraft/server";

export class RedundancyStoragePrismarine {
    constructor(isInternalDocument) {
        this.ns = isInternalDocument ? 'rbkign:' : ''
    }
    load(table) {
        let segmentCount = 0;
        try {
            segmentCount = world.getDynamicProperty(
                `${this.ns}redundantstorage:segment_count_${table}`
            );
        } catch (e) {
            segmentCount = 0;
        }
        if (!segmentCount) segmentCount = 0;
        if (segmentCount <= 0) return [];
        if (typeof segmentCount !== "number") {
            world.setDynamicProperty(
                `${this.ns}redundantstorage:segment_count_${table}`,
                0
            );
            return [];
        }
        let val = ``;
        for (let i = 0; i < segmentCount; i++) {
            let valToAppend = ``;
            try {
                valToAppend = world.getDynamicProperty(
                    `${this.ns}redundantstorage_${i}:${table}`
                );
            } catch {
                valToAppend = ``;
            }
            if (!valToAppend) valToAppend = ``;
            val += valToAppend;
        }
        try {
            return JSON.parse(val);
        } catch {
            return [];
        }
    }
    save(table, data) {
        let data2 = JSON.stringify(data).match(/.{1,31000}/g);
        for (let i = 0; i < data2.length; i++) {
            system.run(() => {
                world.setDynamicProperty(
                    `${this.ns}redundantstorage_${i}:${table}`,
                    data2[i]
                );
            });
        }
        system.run(() => {
            world.setDynamicProperty(
                `segmentedstorage:segment_count_${table}`,
                data2.length
            );
        });
    }
}
