import configAPI from "./api/config/configAPI";
import versionData from "./versionData";

configAPI.registerProperty("CurrVersion", configAPI.Types.Number, versionData.versionInfo.versionInternalID, {label: "Do NOT edit"})

let migrationMap = new Map();
migrationMap.set(11, function() {
    // console.warn("Migrating to v11")
})

configAPI.db.waitLoad().then(()=>{
    let ver = configAPI.getProperty("CurrVersion");
    if(ver < versionData.versionInfo.versionInternalID) {
        // TODO
    }
})