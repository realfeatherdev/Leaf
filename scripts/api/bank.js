/*
1

"im hungry" says the children in my basement, all in unison

i have no idea what that means but i feed them frozen milk

little do i know they are lactose intolerant

in life, shit happens. that includes in the basement.

moral of the story: dont buy milk
*/
import { system } from "@minecraft/server";
import { prismarineDb } from "../lib/prismarinedb";
import { SegmentedStoragePrismarine } from "../prismarineDbStorages/segmented";
import playerStorage from "./playerStorage";
import { ModalFormData } from "@minecraft/server-ui";
import { NUT_UI_MODAL } from "../uis/preset_browser/nutUIConsts";

class Bank {
    constructor() {
        this.db = prismarineDb.customStorage(
            "Bank",
            SegmentedStoragePrismarine
        );
        this.db.waitLoad().then(() => {
            system.afterEvents.scriptEventReceive.subscribe((e) => {
                let player = e.sourceEntity
                if(!player || player.typeId !== 'minecraft:player') return
                let currencies = prismarineDb.economy.getCurrencies()
                if (e.id == "leaf:deposit_to_bank") {
                    let form = new ModalFormData();
                    form.title(NUT_UI_MODAL + 'Deposit to bank')
                    form.dropdown('Currency', prismarineDb.economy.getCurrencies().map((_) => {
                        return `${_.symbol} ${_.displayName}`
                    }))
                    form.textField('Amount', 'The amount of money to deposit')
                    form.show(player).then((res) => {
                        let [currindex,amountStr] = res.formValues;
                        let curnc = currencies[currindex]
                        if(isNaN(+amountStr)) return player.error('Amount must be a number!'), player.runCommand(`leaf:open @s "leaf/bank"`)
                        let succ = this.deposit(player,+amountStr,curnc.scoreboard)
                        if(!succ) player.error('You do not have enough funds to put that much in your bank'), player.runCommand(`leaf:open @s "leaf/bank"`)
                        if(succ) player.success('Deposited currency into bank!'), player.runCommand(`leaf:open @s "leaf/bank"`)
                    })
                }
                if (e.id == "leaf:withdraw_from_bank") {
                    let form = new ModalFormData();
                    form.title(NUT_UI_MODAL + 'Withdraw from bank')
                    form.dropdown('Currency', prismarineDb.economy.getCurrencies().map((_) => {
                        return `${_.symbol} ${_.displayName}`
                    }))
                    form.textField('Amount', 'The amount of money to withdraw')
                    form.show(player).then((res) => {
                        let [currindex,amountStr] = res.formValues;
                        let curnc = currencies[currindex]
                        if(isNaN(+amountStr)) return player.error('Amount must be a number!'), player.runCommand(`leaf:open @s "leaf/bank"`)
                        let succ = this.withdraw(player,+amountStr,curnc.scoreboard)
                        if(!succ) player.error('You do not have enough funds in the bank to get that much from your bank'), player.runCommand(`leaf:open @s "leaf/bank"`)
                        if(succ) player.success('Withdrew currency from bank!'), player.runCommand(`leaf:open @s "leaf/bank"`)
                    })
                }
            })
        })
    }
    getPlayerBankData(player) {
        let playerId = playerStorage.getID(player);
        let doc = this.db.findFirst({ player: playerId });
        if (doc) {
            return doc;
        } else {
            let data = {
                player: playerId,
                currencies: [],
            };
            let id = this.db.insertDocument(data);
            return { id, data }
        }
    }
    getPlayerMoneyInText(player) {
        let bData = this.getPlayerBankData(player)
        if (!bData) return;
        let stuffs = ['§bCurrencies', '§8-=-=-=-=-']
        for (const thing of bData.data.currencies) {
            stuffs.push(`§d${thing.scoreboard}§8: §r§e${thing.amount}`)
        }
        return stuffs.join('§r\n')
    }
    // fuck you this function is useless
    setPlayerBankData(player, data = {}) {
        this.getPlayerBankData(player);
        let playerId = playerStorage.getID(player);
        let doc = this.db.findFirst({ player: playerId });
        this.db.overwriteDataByID(doc.id, data);
    }
    deposit(player, amount, currency = "default") {
        // What the fuck was that if statement.... just fucking check if no curnc!??!!?!??!
        let curnc = prismarineDb.economy.getCurrency(currency); // curnc reference?! no way!
        if (!curnc) return;
        let bData = this.getPlayerBankData(player);
        if (!bData) return;
        let curncs = bData.data.currencies
        if (prismarineDb.economy.getMoney(player, curnc.scoreboard) < amount) {
            return false;
        }
        prismarineDb.economy.removeMoney(player, amount, curnc.scoreboard)
        let dCurnc = curncs.find(_ => _.scoreboard === curnc.scoreboard)
        if (!dCurnc) {
            curncs.push({ scoreboard: curnc.scoreboard, amount });
        } else {
            dCurnc.amount += amount;
        }
        this.db.overwriteDataByID(bData.id, bData.data)
        return true
    }
    withdraw(player, amount, currency) {
        let curnc = prismarineDb.economy.getCurrency(currency); // curnc reference?! no way! (2)
        if (!curnc) return;
        let bData = this.getPlayerBankData(player);
        if (!bData) return;
        let curncs = bData.data.currencies
        let dCurnc = curncs.find(_ => _.scoreboard === curnc.scoreboard)
        if (!dCurnc || dCurnc.amount < amount) return false;
        prismarineDb.economy.addMoney(player, amount, curnc.scoreboard)
        dCurnc.amount -= amount;
        this.db.overwriteDataByID(bData.id, bData.data)
        return true
    }
}

export default new Bank;