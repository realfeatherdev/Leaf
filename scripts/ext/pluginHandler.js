import { pluginRouter } from "./mainPluginRouter";
import * as yup from '../lib/yup.esm.js'
import uiBuilder from "../api/uiBuilder.js";
class Schemas {
    static pluginRegisterSchema = yup.object({
        name: yup.string().max(32).min(2),
        author: yup.string(),
        id: yup.string().matches(/^[a-z0-9_]+:[a-z0-9_]+$/)
    })
}
class PluginHandler {
    constructor() {
        this.router = pluginRouter;
        this.pluginStore = [];
        this.router.registerListener(`leafdev:get_creations`, (msg)=>{
            return uiBuilder.getAllUIs()
        })
        this.router.registerListener("leafdev:register_plugin", (msg)=>{
            try {
                let valid = Schemas.pluginRegisterSchema.validateSync(JSON.parse(msg), {strict: true});
                if(this.pluginStore.find(_=>_.id == valid.id)) return {error: true, message: "Duplicate plugin"};
                this.pluginStore.push(valid)
                return {error: false, key: ((Date.now() * 1000) + Math.floor(Math.random() * 1000)).toString(16)}
            } catch {
                return {error: true, message: "An unknown error ocurred"}
            }
        })
        this.router.registerListener("leafdev:status", (a)=>{
            return "READY"
        })
        // this.router.send({"event": "leaf:ready2", "force": true})
    }
}

export default new PluginHandler();