// PrismarineDB Version: 2.0
import { world, system } from '@minecraft/server';
import * as underscore from './underscore';
import { NonPersistentStorage } from './storage/NonPersistentStorage';
import { ScoreboardPersistentStorage } from './storage/ScoreboardPersistentStorage';
import { WorldPersistentStorage } from './storage/WorldPersistentStorage';
import { EntityPersistentStorage } from './storage/EntityPersistentStorage';
import { Economy } from './economy/economy';
import { ActionForm } from './forms/ActionForm';
import { ModalForm } from './forms/ModalForm';
import { SegmentedStoragePrismarine } from './storage/SegmentedStorage';
function MergeRecursive(obj1, obj2) {
    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor == Object) {
                obj1[p] = MergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch (e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }
    return obj1;
}
let nonPersistentData = {};
let sessions = {};
const generateUUID = () => {
    let
        d = new Date().getTime(),
        d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
};
let databaseTables = []
class PrismarineDBTable {
    #storage;
    constructor(tableName = "default", storage) {
        this.#storage = storage;
        this.table = tableName;
        this.data = [];
        this.trash = [];
        this.folders = [];
        this.load().then(() => {
            this.loadTrash();
            this.loadFolders();
        });

        this.updateEvents = [];
        databaseTables.push(msg => this.#globcmd(msg));

    }
    #globcmd(msg) {
        if (msg === "CLEAR") {
            this.clear();
        }
        if (msg === "RELOAD") {
            this.loaded = false;
            this.load().then(() => {
                this.loadTrash();
                this.loadFolders();
            });
        }
    }

    trashAll() {
        for (const doc of this.data) {
            this.trashDocumentByID(doc.id)
        }
    }
    runCommand(text) {
        let args = text.split(' ');
        if (args[0].toLowerCase() == "clear") {
            this.clear();
        }
    }
    loadFolders() {
        this.folders = this.#storage.load(`${this.table}~folders`);
    }
    saveFolders() {
        this.#storage.save(`${this.table}~folders`, this.folders);
    }
    loadTrash() {
        this.trash = this.#storage.load(`${this.table}~trash`);
    }
    waitLoad() {
        return new Promise((resolve, reject) => {
            let interval = system.runInterval(() => {
                if (!this.loaded) return;
                system.clearRun(interval);
                resolve(true);
            }, 1);
        });
    }

    saveTrash(trashedData = null) {
        this.#storage.save(`${this.table}~trash`, this.trash);
        try {
            if (trashedData && this.#storage.trashable && this.#storage.name && stores[this.#storage.name]) {
                let data = stores["WORLD_PERSISTENT"].load(`+PRISM:$TRASH`)
                data.push({
                    store: this.#storage.name,
                    table: this.table,
                    data: trashedData
                })
                stores["WORLD_PERSISTENT"].save(`+PRISM:$TRASH`, data);
            }
        } catch { }
    }
    load() {
        return new Promise((resolve) => {
            let storage = this.#storage;
            system.run(() => {
                let data = storage.load(this.table);
                this.data = data ?? [];
                this.loaded = true; // ← MISSING
                resolve(data);
            });

        });
    }
    save() {
        this.#storage.save(this.table, this.data);
        this.#updateEvent();
    }

    clear() {
        this.data = [];
        this.save();
    }

    #genID() {
        let id = Date.now();
        while (this.getByID(id)) id++;
        return id;
    }

    
    get rawData() {
        return this.data
    }
    createFolder(name) {
        if (this.folders.find(_ => _.name == name)) return;
        this.folders.push({
            name,
            documentIDs: []
        });
        this.saveFolders();
    }
    getFolderDocuments(name) {
        this.loadFolders();
        let folder = this.folders.find(_ => _.name == name);
        if (!folder) return;
        let docs = [];
        for (const document of folder.documentIDs) {
            let doc = this.getByID(document);
            if (!doc) {
                folder.documentIDs = folder.documentIDs.filter(_ => _ != document);
                this.saveFolders();
            }
            docs.push(doc);
        }
        return docs;
    }
    addDocumentToFolder(name, id) {
        this.loadFolders();
        let folder = this.folders.findIndex(_ => _.name == name);
        if (folder < 0) return;
        if (this.folders[folder].documentIDs.includes(id) || !this.getByID(id)) return;
        this.folders[folder].documentIDs.push(id);
        this.saveFolders();
    }
    getFolders() {
        return this.folders.map(_ => _.name);
    }
    deleteFolder(name) {
        this.folders = this.folders.filter(_ => _.name != name);
        this.saveFolders();
    }
    #invokeEvent(...args) {
        for (const namespace in eventHandlers) {
            if (namespace.startsWith('+PRISM:')) {
                eventHandlers[namespace].emit(...args);
            }
        }
    }
    insertDocument(data) {
        let id = this.#genID();
        this.data.push({
            id,
            data,
            createdAt: Date.now(),
            updatedAt: Date.now()
        })
        this.save();
        this.#invokeEvent('$insert', { id, data, table: this.table, storage: this.#storage });
        return id;
    }

    overwriteDataByID(id, data) {
        let docIndex = this.data.findIndex(document => document.id == id);
        if (docIndex < 0) return null;
        this.data[docIndex].data = data;
        this.data[docIndex].updatedAt = Date.now();
        this.save();
        return data;
    }
    matchesQuery(query, data) {
        if (typeof query === "string" && typeof data === "string") return query == data;
        if (typeof query === "object" && typeof data === "string") {
            if (query.lengthGreaterThan) return data.length > query.lengthGreaterThan
            if (query.lengthLessThan) return data.length > query.lengthLessThan
            return false;
        }
        if (typeof query === "object" && typeof data === "object") {
            if (data.type && data.type == "Date") {
                if (query.after) return new Date(data.timestamp).getTime() > query.after
                if (query.before) return new Date(data.timestamp).getTime() < query.before
                return false;
            } else {
                let unsuccessfulRuns = 0;
                function matchQueryRecursive(query) {
                    for (const key in query) {
                        if (typeof query[key] !== "object") {
                            if (!data[key] || data[key] != query[key]) unsuccessfulRuns++
                        } else if (typeof query[key] === "object") {
                            matchQueryRecursive(query[key]);
                        }
                    }
                }
                matchQueryRecursive(query);
                return unsuccessfulRuns == 0;
            }
        }
    }
    findDocuments(query, legacy = false) {
        let docs = [];
        for (const doc of this.data) {
            if (query == null) {
                docs.push(doc);
                continue;
            }
            if (underscore.isMatch(doc.data, query)) docs.push(doc);
        }
        return docs;
    }
    findFirst(query) {
        let docs = this.findDocuments(query);
        if (docs.length) return docs[0];
        return null;
    }
    updateFirstDocumentByQuery(query, data) {
        let doc = this.findFirst(query);
        if (!doc) return false;
        if (typeof data === "object")
            return this.overwriteDataByID(doc.id, MergeRecursive(doc.data, data));
        else
            return this.overwriteDataByID(doc.id, data);
    }
    overwriteFirstDocumentByQuery(query, data) {
        let doc = this.findFirst(query);
        if (!doc) return false;
        return this.overwriteDataByID(doc.id, data);
    }
    deleteDocumentByID(id) {
        let docIndex = this.data.findIndex(document => document.id == id);
        if (docIndex < 0) return false;
        this.data.splice(docIndex, 1);
        this.save();
        this.#invokeEvent('$delete', { method: 'DELETE_BY_ID', docIndex, id });
        return true;
    }
    deleteFirstDocumentByQuery(query) {
        let doc = this.findFirst(query);
        if (!doc) return false;

        let docIndex = this.data.findIndex(d => d.id === doc.id);
        this.#invokeEvent('$delete', {
            method: 'DELETE_BY_QUERY_FIRST',
            docIndex,
            id: doc.id
        });

        return this.deleteDocumentByID(doc.id);
    }


    getByID(id) {
        let docIndex = this.data.findIndex(document => document.id == id);
        if (docIndex < 0) return null;
        return this.data[docIndex];
    }

    createKeyValDocument(id) {
        if (this.findFirst({ __keyval_id: id })) return;
        return this.insertDocument({
            type: "__keyval__",
            __keyval_data: {},
            __keyval_id: id
        });
    }

    keyval(id) {
        return new Promise(resolve => {
            const interval = system.runInterval(() => {
                if (!this.loaded) return;

                let doc = this.findFirst({ __keyval_id: id });
                let docID = doc ? doc.id : this.createKeyValDocument(id);

                system.clearRun(interval);
                resolve(this.#keyval(docID));
            }, 1);
        });
    }

    trashDocumentByID(id) {
        this.loadTrash();
        this.load();
        let data = this.getByID(id);
        if (data) {
            let newData = JSON.parse(JSON.stringify(data));
            newData.expirationDate = Date.now() + (1000 * 60 * 60 * 24 * 30);
            this.trash.push(newData);
            this.deleteDocumentByID(id);
            this.save();
            this.saveTrash(newData);
        }
    }
    getTrashedDocumentByID(id) {
        this.loadTrash();
        this.load();
        let docIndex = this.trash.findIndex(document => document.id == id);
        if (docIndex < 0) return null;
        return this.trash[docIndex];
    }
    getTrashedDocuments() {
        for (const trash of this.trash) {
            if (Date.now() >= trash.expirationDate) this.deleteTrashedDocumentByID(trash.id);
        }
        return this.trash;
    }
    deleteTrashedDocumentByID(id) {
        let docIndex = this.trash.findIndex(document => document.id == id);
        if (docIndex < 0) return false;
        this.trash.splice(docIndex, 1);
        this.saveTrash();
        this.save();
        return true;
    }
    untrashDocumentByID(id) {
        let data = this.getTrashedDocumentByID(id);
        if (data) {
            this.data.push(data);
            this.deleteTrashedDocumentByID(id);
            this.save();
            this.saveTrash();
        }
    }
    #keyval(id) {
        const get = (key, defaultValue = null) => {
            this.load();
            let doc = this.getByID(id);
            let val = doc.data.__keyval_data[key] ? doc.data.__keyval_data[key].data : null;
            if (defaultValue != null && !val) return defaultValue;
            return val;
        }
        const set = (key, val) => {
            this.load();
            let doc = this.getByID(id);
            let currentValue = doc.data.__keyval_data[key] ? doc.data.__keyval_data[key].data : null;
            let newValue = {};
            if (currentValue && currentValue.createdAt) {
                newValue.createdAt = currentValue.createdAt;
            } else {
                newValue.createdAt = Date.now();
            }
            newValue.updatedAt = Date.now();
            newValue.data = val;
            doc.data.__keyval_data[key] = newValue;
            this.overwriteDataByID(doc.id, doc.data);
        }
        const del = (key) => {
            this.load();
            let doc = this.getByID(id);
            if (doc.data.__keyval_data[key]) delete doc.data.__keyval_data[key];
        }
        const has = (key) => {
            this.load();
            let doc = this.getByID(id);
            if (doc.data.__keyval_data.hasOwnProperty(key)) {
                return true;
            } else {
                return false;
            }
        }
        const keys = (key) => {
            this.load();
            let doc = this.getByID(id);
            return Object.keys(doc.data.__keyval_data)
        }
        return { get, set, delete: del, has, keys };
    }
    #updateEvent() {
        for (const event of this.updateEvents) {
            event();
        }
    }
    onUpdate(fn) {
        this.updateEvents.push(fn);
    }
}

let eventHandlers = {};
class EventHandler {
    constructor(namespace) {
        this.killed = false;
        this.events = [];
        this.namespace = namespace;
        this.attachedToDb = false;
    }
    attachToDb(table) {
        table.onUpdate(() => {
            if (!this.killed)
                this.emit("$DB_UPDATE", table);
        })
        this.attachedToDb = true;
    }
    emitToHandler(namespace, event, ...args) {
        if (namespace.startsWith('+PRISM:')) throw new Error("Cant emit to reserved handlers")
        if (eventHandlers[namespace] && !eventHandlers[namespace].killed)
            eventHandlers[namespace].emit(`${event}~${this.namespace}`, ...args)
    }
    emitToAllHandlers(event, ...args) {
        for (const namespace in eventHandlers) {
            if (namespace.startsWith('+PRISM:')) continue;
            if (eventHandlers[namespace].killed) continue;
            eventHandlers[namespace].emit(`${event}~${this.namespace}`, ...args);
        }
    }
    emit(event, ...args) {
        let eventName = event.split('~')[0];
        let eventFrom = event.split('~').length > 1 ? event.split('~')[1] : null;
        this.events.forEach((eventData, i) => {
            console.log(eventData)
            if (eventData.name != eventName && eventData.name != "$ALL") return;
            if (eventData.name == eventName) {
                if (eventData.name == "$ALL") {
                    eventData.handle.call({
                        from: eventFrom
                    }, eventName, ...args)

                    if (eventData.once) this.events.splice(i, 1);
                    return;
                }
                eventData.handle.call({
                    from: eventFrom
                }, ...args)
                if (eventData.once) this.events.splice(i, 1);
            }
        })
    }
    killEventHandler() {
        this.events = [];
        this.killed = true;
        this.attachedToDb = false;
    }
    on(event, fn) {
        this.events.push({
            name: event,
            handle: fn,
            once: false
        })
    }
    onDbUpdate(fn) {
        if (!this.attachedToDb) throw new Error("You cant check for DB updates before attaching a DB")
        this.events.push({
            name: "$DB_UPDATE",
            handle: fn,
            once: false
        })
    }
    onAll(fn) {
        this.events.push({
            name: "$ALL",
            handle: fn,
            once: false
        })
    }
    once(fn) {
        this.events.push({
            name: "all",
            handle: fn,
            once: true
        })
    }
}
class ExtensionRegistry {
    constructor(name) {
        this.extensionName = name;
        this.handler = new EventHandler(`+PRISM:${name}`);
        eventHandlers[`+PRISM:${name}`] = this.handler;
        this.onInsert2 = () => { }
        this.onDelete2 = () => { }
        this.#initialize();
    }
    #initialize() {
        this.handler.on('$insert', (...args) => {
            this.onInsert2(...args);
        })
        this.handler.on('$delete', (...args) => {
            this.onDelete2(...args);
        })
    }
    onInsert(fn) {
        this.onInsert2 = fn;
    }
    onDelete(fn) {
        this.onDelete2 = fn;
    }
}
class FunctionStore {
    #funcs;
    #groupName;
    constructor(name) {
        this.#funcs = new Map();
        this.#groupName = name;
    }
    add(name, fn) {
        this.#funcs.set(name, fn);
    }
    getList() {
        return this.#funcs.keys();
    }
    call(name, ...args) {
        if (!this.#funcs.has(name)) throw new Error(`Error: No function named "${name}" in ${this.#groupName}""`);
        return this.#funcs.get(name)(...args);
    }
}
class FunctionStoreMain {
    #stores;
    constructor() {
        this.#stores = [];
    }

    getStore(name) {
        if (this.#stores[name]) return this.#stores[name];
        this.#stores[name] = new FunctionStore(name);
        return this.#stores[name];
    }
}
function isVec3(obj) {
    return typeof obj === "object" &&
        !Array.isArray(obj) &&
        obj.hasOwnProperty('x') &&
        typeof obj.x === "number" &&
        obj.hasOwnProperty('y') &&
        typeof obj.y === "number" &&
        obj.hasOwnProperty('z') &&
        typeof obj.z === "number"
}
function vec3toString(obj) {
    return `${obj.x},${obj.y},${obj.z}`;
}
function stringToVec3(str) {
    return {
        x: parseFloat(str.split(',')[0]),
        y: parseFloat(str.split(',')[1]),
        z: parseFloat(str.split(',')[2]),
    }
}
function filterVec3(obj) {
    if (!isVec3(obj)) return;
    return {
        x: obj.x,
        y: obj.y,
        z: obj.z
    }
}
class PositionalDB {
    #table;
    constructor(table = "default") {
        this.#table = table;
    }
    getPosition(obj) {
        if (!isVec3(obj)) return;
        let get = (key) => {
            let data = {};
            try {
                data = JSON.parse(world.getDynamicProperty(`prismarine_positionaldb_${this.#table}:${vec3toString(obj)}`));
            } catch { data = {} }
            if (!data || data == {}) data = {};
            if (data.hasOwnProperty(key)) return data[key];
            return null;
        }
        let set = (key, val) => {
            let data = {};
            try {
                data = JSON.parse(world.getDynamicProperty(`prismarine_positionaldb_${this.#table}:${vec3toString(obj)}`));
            } catch { data = {} }
            if (!data || data == {}) data = {};
            data[key] = val;
            world.setDynamicProperty(`prismarine_positionaldb_${this.#table}:${vec3toString(obj)}`, JSON.stringify(data));
        }
        let deleteValue = (key) => {
            let data = {};
            try {
                data = JSON.parse(world.getDynamicProperty(`prismarine_positionaldb_${this.#table}:${vec3toString(obj)}`));
            } catch { data = {} }
            if (!data || data == {}) data = {};
            if (data.hasOwnProperty(key)) delete data[key];
            world.setDynamicProperty(`prismarine_positionaldb_${this.#table}:${vec3toString(obj)}`, JSON.stringify(data));
        }
        let has = (key) => {
            let data = {};
            try {
                data = JSON.parse(world.getDynamicProperty(`prismarine_positionaldb_${this.#table}:${vec3toString(obj)}`));
            } catch { data = {} }
            if (!data || data == {}) data = {};
            return data.hasOwnProperty(key);
        }
        return { set, has, get, delete: deleteValue };
    }
}
var PermissionSystem = class {
    constructor() {
        this._db = new PrismarineDBTable("+PRISM:permsv6", new SegmentedStoragePrismarine())
      // __privateGet(this, _db).clear();
        this._db.waitLoad().then(()=>{
            if (!this._db.findFirst({ type: "ROLE", default: true })) {
                this._db.insertDocument({
                    type: "ROLE",
                    default: true,
                    defaultAdmin: false,
                    isAdmin: false,
                    permissions: {},
                    edited: false,
                    tag: "default"
                });
            }
            if (!this._db.findFirst({ type: "ROLE", defaultAdmin: true })) {
                this._db.insertDocument({
                    type: "ROLE",
                    default: false,
                    defaultAdmin: true,
                    isAdmin: true,
                    permissions: {},
                    edited: false,
                    tag: "admin"
                });
            }
        })
        this._defaultPermissions = [];
    }
    GET_RAW_DB() {
        return this._db
    }
    setDefaultPermissions(newDefaultPerms) {
        this._defaultPermissions = newDefaultPerms;
    }
    getDefaultPermissions() {
        return this._defaultPermissions;
    }
    createRole(tag) {
        if (this._db.findFirst({ type: "ROLE", tag })) throw new Error("Role already exists");
        this._db.insertDocument({
            type: "ROLE",
            default: false,
            isAdmin: false,
            defaultAdmin: false,
            permissions: {},
            tag,
            edited: false
        });
    }
    getRole(tag) {
        return this._db.findFirst({ type: "ROLE", tag });
    }
    getPerms(tag) {
        let perms = [];
        let role = this.getRole(tag);
        if (role) perms = role.data.permissions;
        return perms;
    }
    setPerms(tag, perms) {
        // console.warn(JSON.stringify(perms))
        let role = this.getRole(tag);
        if (!role) return;
        role.data.permissions = perms;
        role.data.edited = true;
        this._db.overwriteDataByID(role.id, role.data);
    }
    getAltPerms(tag) {
        let perms = [];
        let role = this.getRole(tag);
        if (role) perms = role.data.altPermissions ? role.data.altPermissions : [];
        return perms;
    }
    setAltPerms(tag, perms) {
        let role = this.getRole(tag);
        if (!role) return;
        role.data.altPermissions = perms;
        role.data.edited = true;
        this._db.overwriteDataByID(role.id, role.data);
    }
    setAdmin(tag, isAdmin2) {
        if (typeof isAdmin2 !== "boolean") return;
        let role = this.getRole(tag);
        if (!role) return;
        role.data.isAdmin = isAdmin2;
        role.data.edited = true;
        this._db.overwriteDataByID(role.id, role.data);
    }
    setTag(tag, newTag) {
        if (this._db.findFirst({ type: "ROLE", tag: newTag })) return;
      // if (typeof isAdmin !== "boolean") return;
        if (tag === "default") return;
        let role = this.getRole(tag);
        if (!role) return;
        role.data.tag = newTag;
        role.data.edited = true;
        this._db.overwriteDataByID(role.id, role.data);
    }
    deleteRole(tag) {
        let role = this.getRole(tag);
        if (!role) return;
        if (role.data.default || role.data.defaultAdmin) return;
        this._db.deleteDocumentByID(role.id);
    }
    getRoles() {
        let roles = [];
        for (const role of this._db.data) {
            roles.push(role.data);
        }
        return roles;
    }
    hasPermission(player, perm) {
        let perms = [];
        for (const role of this.getRoles()) {
            if (player.hasTag(role.tag) || role.tag === "default") {
                // if (role.default && !role.edited && role.permissions.includes(perm)) return true;
                if (role.isAdmin) return true;
                perms.push(...Object.keys(role.permissions).filter(key => role.permissions[key]));
                // if(role.altPermissions) perms.push(...role.altPermissions);
            }
        }
        return perms.includes(perm);
    }
};

class KeyValTemplate {
    /**
     * 
     * @param {string} key 
     * @returns {any}
     */
    get(key) { }
    /**
     * 
     * @param {string} key 
     * @param {any} value
     */
    set(key, value) { }
    /**
     * 
     * @param {string} key 
     * @returns {boolean}
     */
    has(key) { }
    /**
     * 
     * @param {string} key 
     */
    delete(key) { }
}
class PlayerStorage {
    constructor(db, keyval, rewardsKeyval) {
        // this.db = prismarineDb.customStorage("PlayerStorage", SegmentedStoragePrismarine);
        // this.keyval = this.db.keyval("playerstorage");
        // this.rewardsKeyval = this.db.keyval("rewards");
        this.db = db;
        this.keyval = keyval;
        this.rewardsKeyval = rewardsKeyval;
    }
    getID(player) {
        if (!ids[player.id]) {
            let entityTable = prismarineDb.entityTable("Data", player);
            let keyval = entityTable.keyval("_data");
            let id = keyval.get("id")
            if (!id) {
                let uuid = generateUUID();
                keyval.set("id", uuid);
                ids[player.id] = uuid;
                return uuid;
            } else {
                ids[player.id] = id;
                return id;
            }
        } else {
            return ids[player.id];
        }
    }
    getScore(player, objective) {
        let score = 0;
        try {
            score = world.scoreboard.getObjective(objective).getScore(player);
        } catch { score = null; }
        return score;
    }
    saveData(player) {
        let scores = [];
        for (const objective of world.scoreboard.getObjectives()) {
            let score = this.getScore(player, objective.id);
            if (score == null) continue;
            scores.push({ objective: objective.id, score });
        }
        let tags = player.getTags();
        let dynamicProperties = {};
        try {
            for (const property of player.getDynamicPropertyIds()) {
                dynamicProperties[property] = player.getDynamicProperty(property);
            }
        } catch { }
        this.keyval.set(this.getID(player), {
            tags,
            dynamicProperties,
            scores,
            name: player.name == "OG clapz9521" ? "Furry" : player.name,
            location: { x: player.location.x, y: player.location.y, z: player.location.z }
        })
    }
    addReward(playerID, currency, amount) {
        if (!prismarineDb.economy.getCurrency(currency)) return;
        let rewards = this.rewardsKeyval.has(playerID) ? this.rewardsKeyval.get(playerID) : [];
        rewards.push({
            amount,
            currency: prismarineDb.economy.getCurrency(currency).scoreboard
        })
        this.rewardsKeyval.set(playerID, rewards);
    }
    getRewards(playerID) {
        let rewards = this.rewardsKeyval.has(playerID) ? this.rewardsKeyval.get(playerID) : [];
        return rewards;
    }
    clearRewards(playerID) {
        if (this.rewardsKeyval.has(playerID)) {
            this.rewardsKeyval.set(playerID, [])
        }
    }
    parseName(name) {
        return name.toLowerCase().replace(/ /g, "").replace(/_/g, "");
    }
    searchPlayersByName(name) {
        let ids = [];
        for (const key of this.keyval.keys()) {
            let data = this.keyval.get(key);
            if (this.parseName(data.name).includes(this.parseName(name))) ids.push(key);
        }
        return ids;
    }
    getPlayerByID(id) {
        return this.keyval.get(id);
    }
}

let stores = {};
class TagDB {
    #table;
    #keyval;

    constructor(table) {
        this.#table = table;
        this.#keyval = this.#table.keyval("TAGDB_")
    }

    getTags() {
        return this.#keyval.has("tags") ? this.#keyval.get("tags") : [];
    }

    addTag(tag) {
        let tags = this.getTags();
        if (tags.includes(tag)) return;
        tags.push(tag);
        this.#keyval.set("tags", [])
    }

    removeTag(tag) {
        let tags = this.getTags();
        if (!tags.includes(tag)) return;
        let index = tags.indexOf(tag);
        if (index < 0) return;
        tags.splice(index, 1);
        this.#keyval.set("tags", [])
    }

    hasTag(tag) {
        let tags = this.getTags();
        return tags.includes(tag)
    }
}
class PrismarineDB {
    #reservedTable;
    #reservedKeyVal;
    #reservedKeyVals;
    #reservedEconomyTable;
    constructor() {
        this.loaded = false;
        this.#reservedTable = new PrismarineDBTable('+PRISM:main', new WorldPersistentStorage())
        this.#reservedEconomyTable = new PrismarineDBTable('+PRISM:economy', new WorldPersistentStorage())
        this.#reservedKeyVal = this.#reservedTable.keyval('+PRISM:reserved');
        this.#reservedKeyVals = {
            _main: this.#reservedKeyVal
        }
        this.permissions = new PermissionSystem();
        this.version = 13;
        this.economy = new Economy(this.#reservedEconomyTable);
        this.config = this.keyval("conf");
        this.playerStorageDB = this.segmentedTable("PStorage");
        this.playerStorageKV = this.playerStorageDB.keyval("playerstorage")
        this.rewardsKV = this.playerStorageDB.keyval("rewards");
        this.playerStorage = new PlayerStorage(this.playerStorageDB, this.playerStorageKV, this.rewardsKV)
    }
    createTagDB(table) {
        if (!(table instanceof PrismarineDBTable)) return;
        return new TagDB(table)
    }
    /**
     * 
     * @param {*} name 
     * @returns {KeyValTemplate}
     */
    keyval(name) {
        if (name.startsWith('+PRISM:')) throw new Error("Keyval names starting with '+PRISM:' are reserved");
        if (this.#reservedKeyVals[name]) return this.#reservedKeyVals[name];
        this.#reservedKeyVals[name] = this.#reservedTable.keyval(name);
        return this.#reservedKeyVals[name];
    }
    table(name) {
        if (name.startsWith('+PRISM:')) throw new Error("Database names starting with '+PRISM:' are reserved");
        let session = new PrismarineDBTable(name, new WorldPersistentStorage());
        sessions[generateUUID()] = session;
        return session;
    }
    segmentedTable(name) {
        if (name.startsWith('+PRISM:')) throw new Error("Database names starting with '+PRISM:' are reserved");
        let session = new PrismarineDBTable(name, new SegmentedStoragePrismarine());
        sessions[generateUUID()] = session;
        return session;
    }
    entityTable(name, entity) {
        if (name.startsWith('+PRISM:')) throw new Error("Database names starting with '+PRISM:' are reserved");
        let session = new PrismarineDBTable(name, new EntityPersistentStorage(entity));
        sessions[generateUUID()] = session;
        return session;
    }
    nonPersistentTable(name) {
        if (name.startsWith('+PRISM:')) throw new Error("Database names starting with '+PRISM:' are reserved");
        let session = new PrismarineDBTable(name, new NonPersistentStorage());
        sessions[generateUUID()] = session;
        return session;
    }
    scoreboardStorage(name) {
        if (name.startsWith('+PRISM:')) throw new Error("Database names starting with '+PRISM:' are reserved");
        let session = new PrismarineDBTable(name, new ScoreboardPersistentStorage());
        sessions[generateUUID()] = session;
        return session;
    }
    customStorage(name, Storage, ...params) {
        if (name.startsWith('+PRISM:')) throw new Error("Database names starting with '+PRISM:' are reserved");
        let session = new PrismarineDBTable(name, new Storage(...params));
        sessions[generateUUID()] = session;
        return session;
    }
    /**
     * 
     * @param {string} namespace 
     * @returns {EventHandler}
     */
    getEventHandler(namespace) {
        if (!eventHandlers[namespace] || (eventHandlers[namespace] && eventHandlers[namespace].killed)) {
            let eventHandler = new EventHandler(namespace);
            eventHandlers[namespace] = eventHandler;
            return eventHandler;
        }
        return eventHandlers[namespace];
    }
    #getStorage(storage) {
        if (typeof storage === "string") {
            switch (storage) {
                case "entity":
                    return EntityPersistentStorage;
                case "world":
                    return WorldPersistentStorage;
            }
        }
        return storage;
    }
    convertBetweenStorageTypes(table, config1, config2) {
        let db1 = new PrismarineDBTable(table, new this.#getStorage(config1.storage, ...(config1.params ? config1.params : [])));
        db1.load();
        let db2 = new PrismarineDBTable(table, new this.#getStorage(config2.storage, ...(config2.params ? config2.params : [])));
        db2.data = db1.data;
        db2.save();
    }
    registerStore(storeClass, ...args) {
        let store = new storeClass(...args);
        if (!store.name) return;
        stores[store.name] = store;
    }
}
const DeleteMethods = {
    DeleteByID: "DELETE_BY_ID",
    DeleteByQueryFirst: "DELETE_BY_QUERY_FIRST"
}
let prismarineDb = new PrismarineDB();
prismarineDb.registerStore(WorldPersistentStorage);
prismarineDb.registerStore(ScoreboardPersistentStorage);
class ColorAPI {
    #variants;
    constructor() {
        this.#variants = new Map([
            [
                "§0", {
                    darker: "§0",
                    lighter: "§8"
                }
            ],
            [
                "§1", {
                    darker: "§1",
                    lighter: "§9"
                }
            ],
            [
                "§2", {
                    darker: "§2",
                    lighter: "§a"
                }
            ],
            [
                "§3", {
                    darker: "§3",
                    lighter: "§b"
                }
            ],
            [
                "§4", {
                    darker: "§4",
                    lighter: "§c",
                }
            ],
            [
                "§5", {
                    darker: "§5",
                    lighter: "§d"
                }
            ],
            [
                "§6", {
                    darker: "§6",
                    lighter: "§e"
                }
            ],
            [
                "§7", {
                    darker: "§7",
                    lighter: "§f"
                }
            ],
            [
                "§8", {
                    darker: "§8",
                    lighter: "§7"
                }
            ],
            [
                "§9", {
                    darker: "§1",
                    lighter: "§9"
                }
            ],
            [
                "§a", {
                    darker: "§2",
                    lighter: "§a"
                }
            ],
            [
                "§b", {
                    darker: "§3",
                    lighter: "§b"
                }
            ],
            [
                "§c", {
                    darker: "§4",
                    lighter: "§c"
                }
            ],
            [
                "§d", {
                    darker: "§5",
                    lighter: "§d"
                }
            ],
            [
                "§e", {
                    darker: "§6",
                    lighter: "§e"
                }
            ],
            [
                "§f", {
                    darker: "§7",
                    lighter: "§f"
                }
            ],
            [
                "§g", {
                    darker: "§6",
                    lighter: "§g"
                }
            ],
            [
                "§h", {
                    darker: "§8",
                    lighter: "§h"
                }
            ],
            [
                "§i", {
                    darker: "§8",
                    lighter: "§i"
                }
            ],
            [
                "§j", {
                    darker: "§j",
                    lighter: "§h"
                }
            ],
            [
                "§m", {
                    darker: "§m",
                    lighter: "§c"
                }
            ],
            [
                "§n", {
                    darker: "§m",
                    lighter: "§n"
                }
            ],
            [
                "§p", {
                    darker: "§p",
                    lighter: "§e"
                }
            ],
            [
                "§q", {
                    darker: "§q",
                    lighter: "§a"
                }
            ],
            [
                "§s", {
                    darker: "§s",
                    lighter: "§b"
                }
            ],
            [
                "§t", {
                    darker: "§t",
                    lighter: "§s"
                }
            ],
            [
                "§u", {
                    darker: "§u",
                    lighter: "§d"
                }
            ]
        ])
    }
    getColorCodes() {
        return [
            "\xA70",
            "\xA71",
            "\xA72",
            "\xA73",
            "\xA74",
            "\xA75",
            "\xA76",
            "\xA77",
            "\xA78",
            "\xA79",
            "\xA7a",
            "\xA7b",
            "\xA7c",
            "\xA7d",
            "\xA7e",
            "\xA7f",
            "\xA7g",
            "\xA7h",
            "\xA7i",
            "\xA7j",
            "\xA7m",
            "\xA7n",
            "\xA7p",
            "\xA7q",
            "\xA7s",
            "\xA7t",
            "\xA7u"
        ];
    }
    getColorNames() {
        return [
            "Black",
            "Dark Blue",
            "Dark Green",
            "Dark Aqua",
            "Dark Red",
            "Dark Purple",
            "Gold",
            "Light Gray",
            "Dark Gray",
            "Blue",
            "Green",
            "Aqua",
            "Red",
            "Light Purple",
            "Yellow",
            "White",
            "Minecoin Gold",
            "Material Quartz",
            "Material Iron",
            "Material Netherite",
            "Material Redstone",
            "Material Copper",
            "Material Gold",
            "Material Emerald",
            "Material Diamond",
            "Material Lapis",
            "Material Amethyst"
        ];
    }

    getColorNamesColored() {
        let names = [];
        let colorNames = this.getColorNames();
        let colorCodes = this.getColorCodes();
        for (let i = 0; i < colorNames.length; i++) {
            names.push(`${colorCodes[i]}${colorNames[i]}`)
        }
        return names;
    }
    isValidColorCode(code) {
        return this.getColorCodes().includes(code)
    }
    keyToColorCode(key) {
        if (key < 0) return this.getColorCodes()[0]
        if (key >= this.getColorCodes().length) return this.getColorCodes()[this.getColorCodes().length - 1];
        return this.getColorCodes()[key]
    }
    colorCodeToKey(code) {
        if (!this.isValidColorCode(code)) return 0;
        return this.getColorCodes().indexOf(code);
    }
    getVariants(code) {
        if (!this.isValidColorCode(code)) return this.#variants.get("§0");
        return this.#variants.get(code)
    }
}
class Player {
    getFirstTagStartingWithPrefix(player, prefix, removePrefix = false) {
        let tag = player.getTags().find(_ => _.startsWith(prefix));
        if (tag) {
            return removePrefix ? tag.substring(prefix.length) : tag;
        } else {
            return null;
        }
    }
    getTagsStartingWithPrefix(player, prefix, removePrefix = false) {
        let tags = player.getTags().filter(_ => _.startsWith(prefix));
        if (tags && tags.length) {
            return removePrefix ? tags.map(tag => tag.substring(prefix.length)) : tags;
        } else {
            return [];
        }
    }
}
export const playerAPI = new Player();
export const colors = new ColorAPI();
export const positionalDb = new PositionalDB();
export const functionStore = new FunctionStoreMain();
export { prismarineDb, EntityPersistentStorage, NonPersistentStorage, ScoreboardPersistentStorage, WorldPersistentStorage, ExtensionRegistry, DeleteMethods, ActionForm, ModalForm, isVec3, filterVec3 }