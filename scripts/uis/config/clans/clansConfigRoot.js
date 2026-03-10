import uiManager from "../../../uiManager";
import config from "../../../versionData";
import { ModalForm } from "../../../lib/form_func";
import configAPI from "../../../api/config/configAPI";
import { prismarineDb } from "../../../lib/prismarinedb";
import versionData from "../../../versionData";
configAPI.registerProperty(
    "clans:enable_pay_to_create",
    configAPI.Types.Boolean,
    false
);
configAPI.registerProperty("clans:clan_price", configAPI.Types.Number, 0);
configAPI.registerProperty(
    "clans:clan_price_currency",
    configAPI.Types.String,
    "default"
);
configAPI.registerProperty(
    "clans:enable_clan_base",
    configAPI.Types.Boolean,
    true
);
configAPI.registerProperty("clans:disable_friendly_fire", configAPI.Types.Boolean, true)
uiManager.addUI(config.uiNames.PVP, "PVP", (player)=>{
    let modal = new ModalForm();
    modal.title("PvP Settings")
    modal.toggle("Hive Knockback", configAPI.getProperty("HiveKB"), ()=>{}, "(BETA) makes knockback stronger, similar to the hive")
    modal.toggle("Attack Tiering", configAPI.getProperty("NoHitLowerTier"), ()=>{}, "Don't allow players to attack others of a different armor tier\nCan be overridden via zones and land claims")
    modal.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, versionData.uiNames.Config.Misc)
        configAPI.setProperty("HiveKB", response.formValues[0])
        configAPI.setProperty("NoHitLowerTier", response.formValues[1])
        return uiManager.open(player, versionData.uiNames.Config.Misc)
    })
})
uiManager.addUI(
    config.uiNames.Config.Clans,
    "Clans configuration",
    (player) => {
        let modalForm = new ModalForm();
        modalForm.toggle(
            "Enable pay to create clan?",
            configAPI.getProperty("clans:enable_pay_to_create")
        );
        modalForm.textField(
            "Clan price - Amount",
            "Enter a price...",
            (configAPI.getProperty("clans:clan_price")
                ? configAPI.getProperty("clans:clan_price")
                : 0
            ).toString()
        );
        let displayOptions = prismarineDb.economy.getCurrencies().map((_) => {
            return `${_.symbol} ${_.displayName}`;
        });
        let internalOptions = prismarineDb.economy.getCurrencies().map((_) => {
            return `${_.scoreboard}`;
        });
        modalForm.dropdown(
            "Clan price - Currency",
            displayOptions.map((_) => {
                return {
                    callback() {},
                    option: _,
                };
            }),
            internalOptions.findIndex(
                (_) =>
                    _ ==
                    prismarineDb.economy.getCurrency(
                        configAPI.getProperty("clans:clan_price_currency")
                    ).scoreboard
            )
        );
        modalForm.toggle(
            "Enable clan base?",
            configAPI.getProperty("clans:enable_clan_base")
        );
        modalForm.toggle("Disable Friendly fire", configAPI.getProperty("clans:disable_friendly_fire"), ()=>{}, "Make it so players cant attack others who are in the same clan")
        modalForm.show(player, false, (player, response) => {
            configAPI.setProperty(
                "clans:enable_pay_to_create",
                response.formValues[0]
            );
            if (/^\d+$/.test(response.formValues[1]))
                configAPI.setProperty(
                    "clans:clan_price",
                    parseInt(response.formValues[1])
                );
            configAPI.setProperty(
                "clans:clan_price_currency",
                internalOptions[response.formValues[2]]
            );
            configAPI.setProperty(
                "clans:enable_clan_base",
                response.formValues[3]
            );
            configAPI.setProperty("clans:disable_friendly_fire", response.formValues[4])
            return uiManager.open(player, config.uiNames.ConfigMain);
        });
        // modalForm.textField("Clan price - Currency", configAPI.getProperty("clans:clan_price_currency").toString())
    }
);
