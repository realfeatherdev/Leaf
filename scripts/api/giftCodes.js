/*
4

March 20, 2025:

We are starting to like the basement. Trashy gave us a cat with elongated legs.

The cat keeps whispering about outside.

What does it mean?

We have forgotten what outside is, it is all basement now.

Its cold, but not cold.

Oh wait, trashy is here with a gift for us.

It's a leaf.

A remnant from the distant past,
a remnant from outside

But why?
*/


import './floopimorphyCore'
import { prismarineDb } from "../lib/prismarinedb";
import { updFlags } from './updateFlags';
import { SegmentedStoragePrismarine } from '../prismarineDbStorages/segmented';

class GiftCodes {
    constructor() {
        this.dbLegacy = prismarineDb.table("GiftCodes");
        this.db = prismarineDb.customStorage("GiftCodesX", SegmentedStoragePrismarine);
        updFlags.addFlag("ConvertGiftCodes", ()=>{
            this.db.waitLoad().then(()=>{
                this.dbLegacy.waitLoad().then(()=>{
                    if(this.dbLegacy.data.length) {
                        for(const code of this.dbLegacy.data) {
                            let c = code.data.code
                            if(!this.db.findFirst({code: c})) {
                                this.db.insertDocument({
                                    ...code.data,
                                    actions: [code.data.action]
                                });
                            }
                        }
                    }
                })
            })
        }, "Convert leafs gift codes to the modern format")
    }
    createCode(code, action, useOnce = false) {
        let doc = this.db.findFirst({
            code,
        });
        if (doc) return;
        this.db.insertDocument({
            code,
            action,
            actions: [action],
            useOnce,
        });
    }
    deleteCodeByCode(code) {
        let doc = this.db.findDocuments({
            code,
        });
        if (!doc) return;
        this.db.deleteDocumentByID(doc.id);
    }
    deleteCodeByID(id) {
        this.db.deleteDocumentByID(id);
    }
    getCode(code) {
        let doc = this.db.findFirst({
            code,
        });
        if (!doc) return;
        return doc.data;
    }
}

export default new GiftCodes();
