import { prismarineDb } from "../lib/prismarinedb";

class ScriptEventActions {
    constructor() {
        this.db = prismarineDb.table("scripteventactions");
    }
    add(action, name) {
        if (this.db.findFirst({ name })) return;
    }
}
// (birds chirping)

// where's the code

// i have no FUCKING idea