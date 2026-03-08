import configAPI from "../../api/config/configAPI";
import homes from "../../api/homes";
import { ActionForm, ModalForm } from "../../lib/form_func";
import { prismarineDb } from "../../lib/prismarinedb";
import uiManager from "../../uiManager";
import versionData from "../../versionData";
uiManager.addUI(versionData.uiNames.Homes.ConfigBasic, "ruighvn8et2", (player)=>{
        let modalForm = new ModalForm();
    modalForm.title("Homes Config");
    modalForm.slider(
        "Home Limit",
        1,
        32,
        1,
        configAPI.getProperty("HomesLimit")
    );
    modalForm.toggle(
        "Azalea Style Shared Homes",
        configAPI.getProperty("AzaleaStyleSharedHomes"),
        () => {},
        `&7When &aenabled&7, shared homes appear in one list as &aOWNER &7/ &aHOME_NAME&7.\n&7When &cdisabled&7, they go in a separate &9Shared Homes&7 menu.`.replaceAll(
            "&",
            "§"
        )
    );
    modalForm.toggle(
        "Bed Homes",
        configAPI.getProperty("BedHomes"),
        () => {},
        `When enabled, the player's spawnpoint (set via bed) will show up in the homes list.\n&eUNSTABLE`.replaceAll(
            "&",
            "§"
        )
    );
    modalForm.show(player, false, (player, response) => {
        if (response.canceled)
            return uiManager.open(player, versionData.uiNames.Homes.Config);
        configAPI.setProperty("HomesLimit", response.formValues[0]);
        configAPI.setProperty("AzaleaStyleSharedHomes", response.formValues[1]);
        configAPI.setProperty("BedHomes", response.formValues[2]);
        return uiManager.open(player, versionData.uiNames.Homes.Config);
    });
})
uiManager.addUI(versionData.uiNames.Homes.ConfigLimitOverrides, "overid", (player)=>{
    let form = new ActionForm();
    form.title("hom / limit overids")
    form.body("i illiterate")
    form.button(`§6Back\n§7go back :3`, null, (player)=>{
        return uiManager.open(player, versionData.uiNames.Homes.Config)
    })
    let roles = prismarineDb.permissions.getRoles().filter(_=>_.tag != "default"); // fuck default tag
    if(!roles.length) {
        form.label("no roles other than default :(")
        form.label("WAIT HOW DID YOU MANGE THAT?")
    }
    let hl = homes.getHLoverrideDoc();
    for(const role of roles) {
        form.button(`§c${role.tag}\n§7click to edit ig`, null, (player)=>{
            let form2 = new ModalForm();
            let roleData = hl.data.roles[role.tag] ? hl.data.roles[role.tag] : {use: false, limit: configAPI.getProperty("HomesLimit"), unlimited: true};
            form2.toggle("Enable Override", roleData.use, ()=>{})
            form2.toggle("Unlimited", roleData.unlimited, ()=>{}, "Make the home limit unlimited, will ignore the limit below")
            form2.slider(
                "Home Limit",
                1,
                32,
                1,
                roleData.limit
            );
            form2.show(player, false, (player, response)=>{
                if(response.canceled) return uiManager.open(player, versionData.uiNames.Homes.ConfigLimitOverrides)
                roleData.use = response.formValues[0]
                roleData.unlimited = response.formValues[1]
                roleData.limit = response.formValues[2]
                hl.data.roles[role.tag] = roleData;
                homes.setHLOverrideDoc(hl);
                return uiManager.open(player, versionData.uiNames.Homes.ConfigLimitOverrides)
            })
        })
    }
    form.label("Add stuff here in leafs role editor :3")
    
    form.show(player, false, (player, response)=>{
        if(response.canceled)
            return uiManager.open(player, versionData.uiNames.Homes.Config)
    })
})
uiManager.addUI(versionData.uiNames.Homes.Config, "MEOW MRRP", (player) => {
    let form = new ActionForm();
    form.title("hom")
    form.body("i pissed my bed last night uwu")
    form.button(`§6Back\n§7go back :3`, null, (player)=>{
        return uiManager.open(player, versionData.uiNames.Config.Misc)
    })
    form.button(`§aBasic Config\n§7Default stuff ig`, null, (player)=>{
        return uiManager.open(player, versionData.uiNames.Homes.ConfigBasic)
    })
    form.button(`§eLimit Overrides\n§7woof woof arf arf imma cat`, null, (player)=>{
        return uiManager.open(player, versionData.uiNames.Homes.ConfigLimitOverrides)
    })
    form.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, versionData.uiNames.Config.Misc)
    })
});
