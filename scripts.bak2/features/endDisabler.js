import { system, world } from "@minecraft/server";
import configAPI from "../api/config/configAPI";

configAPI.registerProperty("DisableEnd", configAPI.Types.Boolean, false)

system.runInterval(()=>{
    if(!configAPI.getProperty("DisableEnd")) return;
    for(const player of world.getPlayers()) {
        if(player.dimension.id.includes('end')) { // i forgort the id :<
            let sp = player.getSpawnPoint()
            player.teleport(sp ? {x: sp.x, y: sp.y, z: sp.z} : world.getDefaultSpawnLocation(), {
                dimension: sp ? sp.dimension : world.getDimension('overworld')
            })
            player.error("The end is disabled!")
        }
    }
},40)