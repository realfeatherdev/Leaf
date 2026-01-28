import { ActionFormData } from '@minecraft/server-ui'

export class ActionForm {
    #form;

    constructor() {
        this.callbacks = [];
        this.#form = new ActionFormData();
    }
    button(text, icon, callback) {
        if(callback) this.callbacks.push(callback)
        else this.callbacks.push(null)

        this.#form.button(text, icon ? icon : undefined);
    }
    title(text) {
        this.#form.title(text);
    }
    body(text) {
        this.#form.body(text);
    }
    show(player, responseFn) {
        this.#form.show(player).then(res=>{
            if(responseFn && typeof responseFn == "function") {
                responseFn(player, res);
            }
            if(res.canceled) return;
            if(this.callbacks[res.selection] && typeof this.callbacks[res.selection] === "function") {
                this.callbacks[res.selection](player, res)
            }
        });
    }
}