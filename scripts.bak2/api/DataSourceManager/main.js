import { prismarineDb } from "../../lib/prismarinedb";
import { SegmentedStoragePrismarine } from "../../prismarineDbStorages/segmented";

class DataSources {
    constructor() {
        this.internal = [
            {
                name: "Player List"
            }
        ]
        this.db = prismarineDb.customStorage("DataSourceManager", SegmentedStoragePrismarine)
    }
}