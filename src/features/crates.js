import { system, world } from "@minecraft/server";
import { prismarineDb } from "../lib/prismarinedb";
import { SegmentedStoragePrismarine } from "../prismarineDbStorages/segmented";
import itemdb from "../api/itemdb";
import uiManager from "../uiManager";
import { ActionForm, ModalForm } from "../lib/form_func";

class Crates {
    static db = prismarineDb.customStorage("Crabs", SegmentedStoragePrismarine);

    static createCrab(name, subtext) { // crab
        // not my ass forgetting how js works
        return Crates.db.insertDocument({
            strtype: "CRAB",
            name,
            subtext,
            items: []
        })
    }

    static addItemToCrab(id, displayName, subtext, weight, itemStack) {
        let [stash, slot] = itemdb.saveItem(itemStack);
        let crab = Crates.db.getByID(id);
        crab.data.items.push({
            id: (Date.now() * 1000) + Math.floor(Math.random() * 1000),
            weight,
            displayName,
            subtext,
            item: {stash, slot},
        })
        Crates.db.overwriteDataByID(crab.id, crab.data);
    }

    static deleteItemFromCrab(crabID, itemID) {
        let crab = Crates.db.getByID(crabID);
        crab.data.items = crab.data.items.filter(_=>{
            return _.id != itemID;
        }) // kawaii code :3c
        Crates.db.overwriteDataByID(crab.id, crab.data);
    }

    static editItem(crabID, itemID, data) {
        let crab = Crates.db.getByID(crabID);
        let itemIndex = crab.data.items.findIndex(_=>_.id == itemID);
        if(itemIndex < 0) return;
        crab.data.items[itemIndex] = {...crab.data.items[itemIndex], ...data}
        Crates.db.overwriteDataByID(crab.id, crab.data);
    }

    static editCrab(crabID, data) {
        let crab = Crates.db.getByID(crabID)
        Crates.db.overwriteDataByID(crab.id, {...crab.data, ...data})
    }

    static deleteCrab(crabID) {
        Crates.db.deleteDocumentByID(crabID)
    }

    static getCrabs() {
        return Crates.db.findDocuments({strtype: "CRAB"}) // return da crabs! :3 🦀🦀🦀🦀🦀
    }
}

uiManager.addUI("crabs", "CRABNSSSSSSSSSSSS!!!!!!!!!!!!! :3c", (player)=>{
    let form = new ActionForm();
    form.title(`Edit Crates`);
    form.label("OwO, whats this?")
    form.button(`§aCreate new crab!\n§7§o[ Creates a crate... ]`, `textures/azalea_icons/1`, (player)=>{
        let modal = new ModalForm();
        modal.title("New Crab")
        modal.textField("Crab Name", "meow")
        modal.textField("Crab Subtext", "Text go under crab!")
        modal.show(player, false, (player, response)=>{
            if(response.canceled) return uiManager.open(player, "crabs")
            Crates.createCrab(response.formValues[0], response.formValues[1])
            uiManager.open(player, "crabs")
        })
    })
    let usedNames = [];
    for(const crab of Crates.getCrabs()) {
        usedNames.push(crab.data.name)
        let usedCount = usedNames.filter(_=>_ == crab.data.name);
        // induce the crab
        form.button(`§f${crab.data.name}§r§f${usedCount > 1 ? ` (#${usedCount})` : ``}\n§r§7${crab.data.subtext}`, `textures/azalea_icons/ChestIcons/Chest7`, (player)=>{
            uiManager.open(player, "crab_edit", crab.id)
        })
    }
    form.show(player, false, (player, response)=>{

    })
})