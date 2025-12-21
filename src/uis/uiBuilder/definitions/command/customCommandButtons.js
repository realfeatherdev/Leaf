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
        }
    }
}