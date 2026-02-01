import configAPI from "../api/config/configAPI";

class Transitioner {
    constructor() {
        this.displayName = "Transitioner";
        this.id = "transitioner";
    }

    load() {
        configAPI.db.waitLoad().then(()=>{
            
        })
    }
}