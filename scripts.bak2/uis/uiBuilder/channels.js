import { themes } from "cherryThemes";
import { world } from "@minecraft/server";
import { colors, prismarineDb } from "../../lib/prismarinedb";
import uiBuilder from "../../api/uiBuilder";
import uiManager from "../../uiManager";
import versionData from "../../versionData";
import { ActionForm, ModalForm } from "../../lib/form_func";
import { NUT_UI_DISBALE_BTN, NUT_UI_TAG } from "../preset_browser/nutUIConsts";

export const CHANNEL_CUSTOMIZER_TYPEID = 18;
export const PREFIX_FMT_DEFAULT = "§8[§r<cc>#<cn>§r§8]";
uiBuilder.definitions.push({
    deftype: "ROOT",
    type: 18,
    name: "Channel",
    getName(doc) {
        return `§r§7Chat Channel: §r§f${doc.data.color}#${doc.data.name ? doc.data.name : doc.data.uniqueID}`
    },
    defaultIcon: "textures/azalea_icons/other/key_c",
    extendEditButtons(actionForm, doc) {
        if(doc.data.type != 18) return;
        actionForm.button(`§eEdit General\n§7Edit basic properties of this channel`, `textures/azalea_icons/other/properties_edit`, (player)=>{
            uiManager.open(player, versionData.uiNames.Channels.Add, doc.id)
        })
        actionForm.button(`§bEdit Visibility\n§7Choose if anyone outside of the channel can see this channel`, null, (player)=>{
            uiManager.open(player, versionData.uiNames.Channels.Visibility, doc.id)
        })
        actionForm.button(`§bEdit Joinable Roles\n§7Choose who can join this channel`, null, (player)=>{
            uiManager.open(player, versionData.uiNames.Channels.Joinability, doc.id)
        })
    }
})
uiManager.addUI(versionData.uiNames.Channels.Visibility, "", (player, id)=>{
    let form = new ActionForm();
    let channel = id > -1 ? uiBuilder.db.getByID(id) : null;
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§r§fEdit Channel Visibility`)
    form.label(`§fEnabling "§eShow to everyone§f" will make channel forwarding make the message not forward to those channels.`)
    form.label(`§fRole forwarding completely §coverrides these settings§f, including channel forwarding`)
    form.button(`§6Back\n§7Go back`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.UIBuilderEdit, id)
    })
    form.button(`${channel.data.showToOtherChannels.localMode ? "§cDisable local mode\n§7Currently: ON" : "§aEnable local mode\n§7Currently: OFF"}`, null, (player)=>{
        channel.data.showToOtherChannels.localMode = !channel.data.showToOtherChannels.localMode
        uiBuilder.db.overwriteDataByID(channel.id, channel.data)
        uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
    })
    if(channel.data.showToOtherChannels.localMode) {
        form.button(`Edit local mode raadius`, null, (player)=>{
            let modal = new ModalForm();
            modal.slider("Radius", 10, 125, 5, channel.data.showToOtherChannels.localModeRadius ? channel.data.showToOtherChannels.localModeRadius : 25);
            modal.show(player, false, (player, response)=>{
                if(response.canceled) return uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
                channel.data.showToOtherChannels.localModeRadius = response.formValues[0]
                uiBuilder.db.overwriteDataByID(channel.id, channel.data)
                return uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
            })
        })

    }
    form.button(`${channel.data.showToOtherChannels.all ? "§cDisable show to everyone\n§7Currently: ON" : "§aEnable show to everyone\n§7Currently: OFF"}`, null, (player)=>{
        channel.data.showToOtherChannels.all = !channel.data.showToOtherChannels.all
        uiBuilder.db.overwriteDataByID(channel.id, channel.data)
        uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
    })
    form.button(`§dEdit Role Forwarding\n§7Show this channels messages to roles`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.Channels.Overrides, id, 0) // 0 = role
    })
    form.button(`§aEdit Channel Forwarding\n§7Show this channels messages to channels`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.Channels.ChannelOverrides, id) // 1 = role
    })

    form.show(player, false, (player, response)=>{

    })
})
uiManager.addUI(versionData.uiNames.Channels.ChannelOverrides, "", (player, id, roleForwardingIndex = -1)=>{
    let channels = uiBuilder.db.findDocuments({type: 18});
    let definition = uiBuilder.definitions.find(_=>_.deftype == "ROOT" && _.type == 18)
    let strings = channels.map(_=>{
        return definition.getName(_)
    })
    let channel = id > -1 ? uiBuilder.db.getByID(id) : null;
    let current = roleForwardingIndex > -1 ? channel.data.showToOtherChannels.roleDependent[roleForwardingIndex].others : channel.data.showToOtherChannels.others;
    let form = new ModalForm();
    form.title(`Edit Channel Forwarding`)
    for(let i = 0;i < strings.length;i++) {
        form.toggle(strings[i], current.includes(channels[i].id));        
    }
    form.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, roleForwardingIndex > -1 ? versionData.uiNames.Channels.ChannelOverrides : versionData.uiNames.Channels.Visibility, id)
        let newCurrent = [];
        for(let i = 0;i < response.formValues.length;i++) {
            if(response.formValues[i]) newCurrent.push(channels[i].id)
        }
        if(roleForwardingIndex > -1) {
            channel.data.showToOtherChannels.roleDependent[roleForwardingIndex].others = newCurrent;
        } else {
            channel.data.showToOtherChannels.others = newCurrent;
        }
        uiBuilder.db.overwriteDataByID(channel.id, channel.data)
        return uiManager.open(player, roleForwardingIndex > -1 ? versionData.uiNames.Channels.Overrides : versionData.uiNames.Channels.Visibility, id)
    })
})
uiManager.addUI(versionData.uiNames.Channels.Overrides, "", (player, id, type = 0)=>{
    // player.error("Role Forwarding is not out yet!")
    // uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
    // return 
    let channel = id > -1 ? uiBuilder.db.getByID(id) : null;
    let form = new ActionForm();
    form.title(`Edit ${type == 1 ? "Channel" : "Role"} Forwarding`);
    form.button(`§6Back`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
    })
    form.button(`Add ${type == 1 ? "Channel" : "Role"}`, null, (player)=>{
        let form2 = new ActionForm();
        form2.button(`§6Back`, null, (player)=>{
            uiManager.open(player, versionData.uiNames.Channels.Overrides, id)
        })
        let roles = prismarineDb.permissions.getRoles().filter(_=>_.tag != "default" && !channel.data.showToOtherChannels.roleDependent.find(_2=>_2.role == _.tag));
        for(const role of roles) {
            form2.button(role.tag, null, (player, response)=>{
                channel.data.showToOtherChannels.roleDependent.push({
                    role: role.tag,
                    all: false,
                    others: []
                })
                uiBuilder.db.overwriteDataByID(channel.id, channel.data)
                uiManager.open(player, versionData.uiNames.Channels.Overrides, id)
            })
        }
        form2.show(player, false, ()=>{})
    })
    if(channel.data.showToOtherChannels.roleDependent.length) {
        for(const role of channel.data.showToOtherChannels.roleDependent) {
            const i = channel.data.showToOtherChannels.roleDependent.findIndex(_=>_.role == role.role)
            form.button(role.role, null, (player)=>{
                let form2 = new ActionForm();
                form2.button(`Back`, null, (player)=>{
                    uiManager.open(player, versionData.uiNames.Channels.Overrides, id, type)
                })
                form2.button(`Edit Channel Forwarding`, null, (player)=>{
                    uiManager.open(player, versionData.uiNames.Channels.ChannelOverrides, id, i)
                })
                form2.button(`${role.all ? "§cDisable show to everyone\n§7Currently: ON" : "§aEnable show to everyone\n§7Currently: OFF"}`, null, (player)=>{
                    channel.data.showToOtherChannels.roleDependent[i].all = !channel.data.showToOtherChannels.roleDependent[i].all
                    uiBuilder.db.overwriteDataByID(channel.id, channel.data)
                    uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
                })
                
                form2.button(`${role.localMode ? "§cDisable local mode\n§7Currently: ON" : "§aEnable local mode\n§7Currently: OFF"}`, null, (player)=>{
                    channel.data.showToOtherChannels.roleDependent[i].localMode = !channel.data.showToOtherChannels.roleDependent[i].localMode
                    uiBuilder.db.overwriteDataByID(channel.id, channel.data)
                    uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
                })
                if(role.localMode) {
                    form2.button(`Edit local mode raadius`, null, (player)=>{
                        let modal = new ModalForm();
                        modal.slider("Radius", 10, 125, 5, role.localModeRadius ? role.localModeRadius : 25);
                        modal.show(player, false, (player, response)=>{
                            if(response.canceled) return uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
                            channel.data.showToOtherChannels.roleDependent[i].localModeRadius = response.formValues[0]
                            uiBuilder.db.overwriteDataByID(channel.id, channel.data)
                            return uiManager.open(player, versionData.uiNames.Channels.Visibility, id)
                        })
                    })
                }
                form2.button(`Remove`, null, (player)=>{
                    channel.data.showToOtherChannels.roleDependent.splice(i, 1)
                    uiBuilder.db.overwriteDataByID(channel.id, channel.data)
                    uiManager.open(player, versionData.uiNames.Channels.Overrides, id, type)
                })
                form2.show(player, false, (player, response)=>{})
            })
        }
    }
    form.show(player, false, ()=>{})
})
uiManager.addUI(versionData.uiNames.Channels.Joinability, "", (player, id)=>{
    let channel = id > -1 ? uiBuilder.db.getByID(id) : null;
    let modalForm = new ModalForm();
    let roles = prismarineDb.permissions.getRoles()
    let strings = roles.map(_=>{
        if(_.default) return "Everyone";
        return _.tag;
    });
    let joinableBy = channel && channel.data.joinable ? channel.data.joinable : []
    for(let i = 0;i < strings.length;i++) {
        modalForm.toggle(strings[i], joinableBy.includes(roles[i].tag))
    }
    modalForm.title("Edit Channel Joinability")
    modalForm.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, versionData.uiNames.UIBuilderEdit, id)
        let new2 = [];
        for(let i = 0;i < response.formValues.length;i++) {
            if(response.formValues[i]) new2.push(roles[i].tag);
        }
        channel.data.joinable = new2;
        uiBuilder.db.overwriteDataByID(channel.id, channel.data)
        uiManager.open(player, versionData.uiNames.UIBuilderEdit, id)
    })
})
// i really gotta redo this system
uiManager.addUI(versionData.uiNames.Channels.Add, "", (player, id = -1)=>{
    let modal = new ModalForm();
    let channel = id > -1 ? uiBuilder.db.getByID(id) : null;
    modal.title(`${channel ? "Edit" : "New"} Channel`)
    modal.textField("Unique ID", "channel-name", channel ? channel.data.uniqueID : "", ()=>{}, "A unique ID for the channel.\nAny name can be used, but it is recommended to only have lowercase letters and numbers and hyphens (-) for channel IDs")
    modal.textField("Channel Name", "name", channel ? channel.data.name : "", ()=>{}, "The visible name for the channel. Leave blank to just use the Unique ID for the visible name");
    modal.textField("Prefix Formatting", PREFIX_FMT_DEFAULT, channel ? channel.data.prefixFMT : PREFIX_FMT_DEFAULT, ()=>{}, "The formatting for the prefix.\n<cc> = Channel Color\n<cn> = Channel Name")
    modal.toggle("Show Prefix", channel ? channel.data.showPrefix ? true : false : true, ()=>{}, "Choose if you want to show the prefix in chat");
    let colorCodes = colors.getColorCodes()
    let colorCodesVisible = colors.getColorNamesColored();
    let indexes = {uniqueID: 0, name: 1, prefixFMT: 2, showPrefix: 3, color: 4};
    modal.dropdown("Color", colorCodesVisible, Math.max(channel ? colorCodes.indexOf(channel.data.color) : 0, 0))
    modal.show(player, false, (player, response)=>{
        if(id == -1) {
            uiBuilder.createChatChannel(
                response.formValues[indexes.uniqueID],
                response.formValues[indexes.name],
                response.formValues[indexes.prefixFMT],
                response.formValues[indexes.showPrefix],
                colorCodes[response.formValues[indexes.color]],
            )
            uiManager.open(player, versionData.uiNames.UIBuilderRoot)
        } else {
            channel.data.uniqueID = response.formValues[indexes.uniqueID]
            channel.data.name = response.formValues[indexes.name]
            channel.data.prefixFMT = response.formValues[indexes.prefixFMT]
            channel.data.showPrefix = response.formValues[indexes.showPrefix]
            channel.data.color = colorCodes[response.formValues[indexes.color]]
            uiBuilder.db.overwriteDataByID(channel.id, channel.data)
            uiManager.open(player, versionData.uiNames.UIBuilderRoot)
        }
    })
})