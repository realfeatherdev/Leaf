import { prismarineDb } from "../../../../lib/prismarinedb"
import uiManager from "../../../../uiManager"
import versionData from "../../../../versionData"

export default {
    extendEditButtons(actionForm, doc) {
        if(doc.data.type == 9) {
            actionForm.button(`§eEdit Commands\n§7Edit this command`, `textures/azalea_icons/other/page_edit`, (player)=>{
                uiManager.open(player, versionData.uiNames.CustomCommandsV2.edit, doc.id)
            })
            actionForm.button(`§dEdit General\n§7Edit this commands settings`, `textures/azalea_icons/other/page_edit`, (player)=>{
                uiManager.open(player, versionData.uiNames.CustomCommandsV2.create, doc.id)
            })
            let perms = prismarineDb.permissions.getPerms("default")
            let hasPerm = perms[`commands.${doc.data.command}`]
            actionForm.button(`${hasPerm ? "§cRemove from default perms" : "§aAdd to default perms"}\n§7yeah`, `textures/items/lock`, (player)=>{
                perms[`commands.${doc.data.command}`] = perms[`commands.${doc.data.command}`] ? false : true
                prismarineDb.permissions.setPerms("default", perms);
                uiManager.open(player, versionData.uiNames.UIBuilderEdit, doc.id)
            })
        }

    }
}