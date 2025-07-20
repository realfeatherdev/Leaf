import { prismarineDb } from "../lib/prismarinedb";
import { SegmentedStoragePrismarine } from "../prismarineDbStorages/segmented";

class FloopimorphyCore {
    constructor() {
        this.db = prismarineDb.customStorage("Floopimorphy", SegmentedStoragePrismarine)
    }
}