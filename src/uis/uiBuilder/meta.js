import { world } from "@minecraft/server";
import uiManager from "../../uiManager";
import versionData from "../../versionData";
import { ActionForm, ModalForm } from "../../lib/form_func";
import uiBuilder from "../../api/uiBuilder";
// import './randomScript'
uiManager.addUI(versionData.uiNames.UIBuilderEditButtonMeta, "Edit button meta", (player, currentMeta = "", save = ()=>{})=>{
    let type = currentMeta.split(' ')[0];
    let form = new ActionForm();
    function reopen() {
        uiManager.open(player, versionData.uiNames.UIBuilderEditButtonMeta, currentMeta, save)
    }
    function addRemoveButton() {
        form.button(`§cRemove meta\n§7Remove the meta from this button`, `textures/azalea_icons/Delete`, (player)=>{
            currentMeta = "";
            reopen();
        })
        form.divider();
    }
    if(type && type == "#PLAYER_LIST") {
        addRemoveButton()
    } else if(type && type == "#ADV_PLAYER_LIST") {
        addRemoveButton()
        form.label(`§cPlease note that advanced player list support is currently a WIP`)
    } else if(type && type == "#INVITES") {
        addRemoveButton()
        form.title(`Edit invite meta`)
        let args = currentMeta.split(' ').slice(1).filter(_=>_.length > 1);
        if(!args.length) {
            form.label(`§eInvite meta is not set up properly.`)
        }
        let isOutgoing = args.length > 1 && args[1].toLowerCase() == "out";
        if(args.length) {
            form.label(`This button will show ${isOutgoing ? "outgoing" : "incoming"} invites from the ${args[0]} invite handler.`)
            form.button(isOutgoing ? "§aMake Incoming\n§7Show only incoming invites" : "§cMake Outgoing\n§7Show only outgoing invites", null, (player)=>{
                if(isOutgoing) {
                    currentMeta = `#INVITES ${args[0]}`;
                    reopen();
                } else {
                    currentMeta = `#INVITES ${args[0]} out`
                    reopen();
                }
            })
        }
        form.button(`§dEdit Handler\n§7Edit this buttons invite handler`, null, (player)=>{
            let modal = new ModalForm();
            modal.title(`Select Invite Handler`);
            let invites = uiBuilder.db.findDocuments({type: 11}).filter(_=>{
                if(_.data.identifier.includes(' ')) return false;
                return true;
            });
            modal.dropdown("Invite Handler", invites.map(_=>{
                return {
                    option: _.data.identifier,
                    callback() {}
                }
            }))
            modal.show(player, false, (player, response)=>{
                if(response.canceled) return reopen();
                // args = [];
                currentMeta = `#INVITES ${invites[response.formValues[0]].data.identifier}`

                reopen()
            })
        })
    } else {
        form.title("Meta editor")
        if(currentMeta) addRemoveButton();
        form.body("Meta fields edit the functionality of the button!")
        form.button(`§aPlayer List\n§7Supports 2P formatting`, null, (player)=>{
            currentMeta = "#PLAYER_LIST"
            reopen();
        })
        form.button(`§bAdv. Player List\n§7Supports 2P formatting`, null, (player)=>{
            currentMeta = "#ADV_PLAYER_LIST"
            reopen();
        })
        form.button(`§eInvite Group\n§7Supports 2P formatting`, null, (player)=>{
            currentMeta = "#INVITES"
            reopen();
        })
        form.button(`§cCustom\n§7Manually input a meta field`, null, (player)=>{
            // currentMeta = "#"
            // reopen();
            let modalForm = new ModalForm();
            modalForm.title("Input Meta")
            modalForm.textField("Meta", "#", currentMeta ? currentMeta : "", (player)=>{}, "this is the meta help text")
            modalForm.show(player, false, (player, response)=>{
                if(response.canceled) return reopen();

                currentMeta = response.formValues[0];
                reopen();
            })
        })
    }
    form.divider();
    form.button(`§aSave\n§7Save this meta`, null, (player)=>{
        save(currentMeta)
    })
    form.label(`§aCurrent Meta§f: §e${currentMeta ? currentMeta : "§cNONE"}`)
    form.show(player, false, ()=>{}).then(res=>{
        if(res.canceled) save(null)
    })
})