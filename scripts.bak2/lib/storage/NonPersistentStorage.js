let nonPersistentData = {};

export class NonPersistentStorage {
    load(table) {
        return nonPersistentData[table] ? nonPersistentData[table] : [];
    }
    save(table, data) {
        nonPersistentData[table] = data;
    }
}
