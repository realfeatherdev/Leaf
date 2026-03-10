import { ModalFormData } from "@minecraft/server-ui";

export class ModalForm {
    #current;
    #form;
    #controlMap;
    constructor() {
        this.#current = -1;
        this.#form = new ModalFormData();
        this.#controlMap = new Map();
    }
    textField(id, label, placeholder, defaultValue) {
        this.#form.textField(label, placeholder, defaultValue ? defaultValue : undefined)
        this.#current++;
        if(id) {
            this.#controlMap.set(id, this.#current);
        }
    }
    slider(id, label, min, max, step, defaultValue) {
        this.#form.slider(label, min, max, step, defaultValue ? defaultValue : 1);
        this.#current++;
        if(id) {
            this.#controlMap.set(id, this.#current);
        }
    }
    dropdown(id, label, options, defaultValue) {
        this.#form.dropdown(label, options, defaultValue ? defaultValue : 0);
        this.#current++;
        if(id) {
            this.#controlMap.set(id, this.#current);
        }
    }
    toggle(id, label, defaultValue) {
        this.#form.toggle(label, defaultValue ? defaultValue : false);
        this.#current++;
        if(id) {
            this.#controlMap.set(id, this.#current);
        }
    }
    show(player, responseFn) {
        this.#form.show(player).then(res=>{
            if(res.canceled) return;
            if(responseFn) responseFn.call({
                get: (id)=>{
                    if(!this.#controlMap.has(id)) return null;
                    return res.formValues[this.#controlMap.get(id)];
                }
            }, player, res);
        })
    }
}