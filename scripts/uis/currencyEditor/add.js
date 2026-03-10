import { ItemStack, ItemTypes, system, world } from "@minecraft/server";
import emojis from "../../api/emojis";
import config from "../../versionData";
// import { ModalForm, prismarineDb } from "../../lib/prismarinedb";
import uiManager from "../../uiManager";
import { prismarineDb } from "../../lib/prismarinedb";
import { ActionForm, ModalForm } from "../../lib/form_func";
import { NUT_UI_MODAL, NUT_UI_TAG, NUT_UI_THEMED } from "../preset_browser/nutUIConsts";
import configAPI from "../../api/config/configAPI";
import { clear, getItemCount } from "../../api/openers/clear";
import { themes } from "../uiBuilder/cherryThemes";

configAPI.registerProperty("ItemCurrency", configAPI.Types.Boolean, true)
let maps = {};
function getScoreboard(str) {
    let scoreboard = world.scoreboard.getObjective(str);
    if(!scoreboard) return world.scoreboard.addObjective(str)
    return scoreboard;
}

system.runInterval(()=>{
    if(!configAPI.getProperty("ItemCurrency")) return;
    for(const currency of prismarineDb.economy.getCurrencies()) {
        let map = maps[currency.scoreboard] ? maps[currency.scoreboard] : new Map();
        try {
            if(!currency.itemID || !ItemTypes.get(currency.itemID)) continue;
            for(const player of world.getPlayers()) {
                let inventory = player.getComponent('inventory')
                let currScore = prismarineDb.economy.getMoney(player, currency.scoreboard);
                if(map.has(player.id)) {
                    let oldScore = map.get(player.id);
                    let diff = currScore - oldScore;
                    if(diff < 0) {
                        clear(inventory, currency.itemID, Math.abs(diff))
                    } else if(diff > 0) {
                        let amt = Math.abs(diff);
                        let testy = new ItemStack(currency.itemID, 1);
                        let remainder = amt % testy.maxAmount
                        let items = [];
                        for(let i = 0;i < Math.floor(amt / testy.maxAmount);i++) {
                            items.push(new ItemStack(currency.itemID, testy.maxAmount))
                        }
                        if(remainder > 0) items.push(new ItemStack(currency.itemID, remainder))
                        for(const item of items) inventory.container.addItem(item);
                    }
                    prismarineDb.economy.setMoney(player, getItemCount(inventory, currency.itemID), currency.scoreboard)
                    map.set(player.id, prismarineDb.economy.getMoney(player, currency.scoreboard))
                } else {
                    map.set(player.id, currScore)
                }

            }
        } catch(e) {
            // world.sendMessage(`${e}`)
        }
        maps[currency.scoreboard] = map;
    }
},10)

uiManager.addUI(
    config.uiNames.CurrencyEditorAdd,
    "Add a currency",
    (player, currencyScoreboard = null, data = {}) => {
        let form2 = new ActionForm();
        if(!data.scoreboard) {
            if (currencyScoreboard) {
                data.symbol =
                    prismarineDb.economy.getCurrency(currencyScoreboard).symbol;
                data.displayName =
                    prismarineDb.economy.getCurrency(
                        currencyScoreboard
                    ).displayName;
                data.itemID =
                    prismarineDb.economy.getCurrency(
                        currencyScoreboard
                    ).itemID;
                data.scoreboard =
                    prismarineDb.economy.getCurrency(currencyScoreboard).scoreboard;
            } else {
                data.symbol = emojis.coins;
                data.displayName = "Test Currency"
                data.scoreboard = "test"
            }
    
        }

        form2.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§r§fCurrency Setup`)
        form2.button(`§dSet settings\n§7Edit the basic settings of this curnc`, `textures/items/config_ui`, (player)=>{
            let form = new ModalForm();
            form.title(NUT_UI_MODAL + "§fDo a curnc");
            form.textField(
                "Scoreboard Objective",
                "Examples: money, gems",
                data.scoreboard ? data.scoreboard : undefined
            );
            form.textField(
                "Display Name",
                "Display name for the currency",
                data.displayName ? data.displayName : undefined
            );
            form.show(player, false, function (player, response) {
                if(response.canceled) return uiManager.open(player, config.uiNames.CurrencyEditorAdd, currencyScoreboard, data)
                data.scoreboard = response.formValues[0]
                data.displayName = response.formValues[1]
                uiManager.open(player, config.uiNames.CurrencyEditorAdd, currencyScoreboard, data)
            })
        })
        form2.button(`§bSet Symbol\n§7Set this currency's symbol (current: ${data.symbol ? data.symbol : "None"})`, `textures/azalea_icons/other/image`, (player)=>{
            uiManager.open(player, config.uiNames.EmojiSelector, (emoji)=>{
                if(emoji != null) {
                    data.symbol = emojis[emoji]
                }
                uiManager.open(player, config.uiNames.CurrencyEditorAdd, currencyScoreboard, data)
            })
        })
        form2.button(`§eSet Item\n§7Optionally link this currency to an item`, `textures/items/diamond`, (player)=>{
            let modalForm = new ModalForm();
            modalForm.title("Mraow :3")
            modalForm.textField("Item ID", "yes", data.itemID ? data.itemID : "")
            modalForm.show(player, false, (player, response)=>{
                if(response.canceled) {
                    return uiManager.open(player, config.uiNames.CurrencyEditorAdd, currencyScoreboard, data)
                    // return 
                }
                data.itemID = ItemTypes.get(response.formValues[0]) ? response.formValues[0] : null;
                return uiManager.open(player, config.uiNames.CurrencyEditorAdd, currencyScoreboard, data)

            })
            ItemTypes.get()
        })
        if(currencyScoreboard) {
            form2.button(`§cDelete\n§7Delete this currency`, `textures/azalea_icons/Delete`, (player)=>{
                uiManager.open(player, config.uiNames.Basic.Confirmation, "Are you sure you want to delete this curnc?", ()=>{
                    prismarineDb.economy.deleteCurrency(currencyScoreboard)
                    uiManager.open(player, config.uiNames.CurrencyEditor)
                }, ()=>{
                    uiManager.open(player, config.uiNames.CurrencyEditorAdd, currencyScoreboard, data)
                })
            })
        }
        form2.button(`§a${currencyScoreboard ? "Save" : "Create"}\n§7Do this curnc`, currencyScoreboard ? `textures/azalea_icons/Save` : `textures/azalea_icons/other/add`, (player)=>{
            if(currencyScoreboard) {
                prismarineDb.economy.editDisplayName(currencyScoreboard, data.displayName)
                prismarineDb.economy.editScoreboard(currencyScoreboard, data.scoreboard)
                prismarineDb.economy.editSymbol(currencyScoreboard, data.symbol)
                prismarineDb.economy.editItemID(currencyScoreboard, data.itemID)
            } else {
                prismarineDb.economy.addCurrency(data.scoreboard, data.symbol, data.displayName, data.itemID)
            }
            uiManager.open(player, config.uiNames.CurrencyEditor)
        })
        // let data = {};
        form2.show(player, false, (player, response)=>{

        })
        // prismarineDb.economy.addCurrency(scoreboard, symbol, displayName);
        // let form = new ModalForm();
        // form.title(NUT_UI_MODAL + "Do a curnc");
        // form.textField(
            // "Scoreboard Objective (Leave Blank To Delete)",
            // "adsdagdsgf",
        //     data.scoreboard ? data.scoreboard : undefined
        // );
        // let emojis1 = [];
        // let emojis2 = [];
        // for (const emoji in emojis) {
        //     emojis1.push(`${emojis[emoji]} :${emoji}:`);
        //     emojis2.push(emojis[emoji]);
        // }
        // form.dropdown(
        //     "Symbol",
        //     emojis1.map((_) => {
        //         return { option: _, callback() {} };
        //     }),
        //     data.symbol
        //         ? emojis2.indexOf(data.symbol) >= 0
        //             ? emojis2.indexOf(data.symbol)
        //             : 0
        //         : 0
        // );
        // form.textField(
        //     "Display Name",
        //     "adfgds",
        //     data.displayName ? data.displayName : undefined
        // );
        // form.show(player, false, function (player, response) {
        //     if (currencyScoreboard) {
        //         if (!response.formValues[0]) {
        //             uiManager.open(
        //                 player,
        //                 config.uiNames.Basic.Confirmation,
        //                 "Are you sure you want to delete this currency?",
        //                 () => {
        //                     prismarineDb.economy.deleteCurrency(
        //                         currencyScoreboard
        //                     );
        //                     uiManager.open(
        //                         player,
        //                         config.uiNames.CurrencyEditor
        //                     );
        //                 },
        //                 () => {
        //                     uiManager.open(
        //                         player,
        //                         config.uiNames.CurrencyEditorAdd,
        //                         currencyScoreboard
        //                     );
        //                 }
        //             );
        //             return;
        //         }
        //         prismarineDb.economy.editDisplayName(
        //             currencyScoreboard,
        //             response.formValues[2]
        //         );
        //         if (response.formValues[0] != currencyScoreboard)
        //             prismarineDb.economy.editScoreboard(
        //                 currencyScoreboard,
        //                 response.formValues[0]
        //             );
        //         prismarineDb.economy.editSymbol(
        //             currencyScoreboard,
        //             emojis2[response.formValues[1]]
        //         );
        //         uiManager.open(player, config.uiNames.CurrencyEditor);
        //         return;
        //     }
        //     // world.sendMessage(emojis2[this.get("symbol")])
        //     prismarineDb.economy.addCurrency(
        //         response.formValues[0],
        //         emojis2[response.formValues[1]],
        //         response.formValues[2]
        //     );
        //     uiManager.open(player, config.uiNames.CurrencyEditor);
        // });
    }
);
