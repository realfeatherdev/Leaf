export const Economy = class {
    constructor(table) {
        this._table = table;
        this._table.waitLoad()
            .then(() => {
                if (
                    !this._table.findFirst({
                        type: "CURRENCY",
                        default: true,
                    })
                ) {
                    system.run(()=>{
                        world3.scoreboard.addObjective("money");
                    })
                    this._table.insertDocument({
                        default: true,
                        symbol: "$",
                        type: "CURRENCY",
                        scoreboard: "money",
                        displayName: "Coins",
                    });
                }
            });
    }
    getTable() {
        return this._table;
    }
    getCurrencies() {
        let array = [];
        for (const doc2 of this._table.findDocuments({
            type: "CURRENCY",
        })) {
            array.push(doc2.data);
        }
        return array;
    }
    editSymbol(currencyScoreboard, newSymbol2) {
        let doc2 = this._table.findFirst({
            type: "CURRENCY",
            scoreboard: currencyScoreboard,
        });
        if (doc2) {
            doc2.data.symbol = newSymbol2;
            this._table.overwriteDataByID(doc2.id, doc2.data);
        }
    }
    editDisplayName(currencyScoreboard, newDisplayName) {
        let doc2 = this._table.findFirst({
            type: "CURRENCY",
            scoreboard: currencyScoreboard,
        });
        if (doc2) {
            doc2.data.displayName = newDisplayName;
            this._table.overwriteDataByID(doc2.id, doc2.data);
        }
    }
    editItemID(currencyScoreboard, newItemID) {
        let doc2 = this._table.findFirst({
            type: "CURRENCY",
            scoreboard: currencyScoreboard,
        });
        if (doc2) {
            doc2.data.itemID = newItemID;
            this._table.overwriteDataByID(doc2.id, doc2.data);
        }
    }
    editScoreboard(currencyScoreboard, newScoreboard) {
        let doc2 = this._table.findFirst({
            type: "CURRENCY",
            scoreboard: currencyScoreboard,
        });
        if (doc2) {
            doc2.data.scoreboard = newScoreboard;
            this._table.overwriteDataByID(doc2.id, doc2.data);
        }
    }
    addCurrency(scoreboard, symbol, displayName, itemID) {
        let doc2 = this._table.findFirst({
            type: "CURRENCY",
            scoreboard,
        });
        if (!doc2) {
            this._table.insertDocument({
                type: "CURRENCY",
                scoreboard,
                symbol,
                displayName,
                itemID
            });
        }
        system.run(()=>{
            try {
                if(!world3.scoreboard.getObjective(scoreboard)) {
                    world3.scoreboard.addObjective(scoreboard)
                }
            } catch {}
        })
    }
    deleteCurrency(scoreboard) {
        let doc2 = this._table.findFirst({
            type: "CURRENCY",
            scoreboard,
        });
        if (doc2) this._table.deleteDocumentByID(doc2.id);
    }
    getCurrency(scoreboard = "default") {
        if (scoreboard == "default") {
            let doc3 = this._table.findFirst({
                type: "CURRENCY",
                default: true,
            });
            return doc3 ? doc3.data : null;
        }
        let doc2 =
            this._table.findFirst({
                type: "CURRENCY",
                scoreboard,
            }) ||
            this._table.findFirst({
                type: "CURRENCY",
                default: true,
            });
        return doc2 ? doc2.data : null;
    }
    addMoney(player, amount2, currencyScoreboard = "default") {
        if (typeof amount2 != "number")
            throw new Error("Amount must be number!");
        if (amount2 < 0) throw new Error("Amount must be positive");
        let currency = this.getCurrency(currencyScoreboard);
        if (currency) {
            let scoreboard = world3.scoreboard.getObjective(
                currency.scoreboard
            );
            if (!scoreboard)
                scoreboard = world3.scoreboard.addObjective(
                    currency.scoreboard,
                    currency.scoreboard
                );
            scoreboard.addScore(player, amount2);
        }
    }
    setMoney(player, amount2, currencyScoreboard = "default") {
        if (typeof amount2 != "number")
            throw new Error("Amount must be number!");
        if (amount2 < 0) throw new Error("Amount must be positive");
        let currency = this.getCurrency(currencyScoreboard);
        if (currency) {
            let scoreboard = world3.scoreboard.getObjective(
                currency.scoreboard
            );
            if (!scoreboard)
                scoreboard = world3.scoreboard.addObjective(
                    currency.scoreboard,
                    currency.scoreboard
                );
            scoreboard.setScore(player, amount2);
        }
    }
    removeMoney(player, amount2, currencyScoreboard = "default") {
        if (typeof amount2 != "number")
            throw new Error("Amount must be number!");
        if (amount2 < 0) throw new Error("Amount must be positive");
        let currency = this.getCurrency(currencyScoreboard);
        if (currency) {
            let scoreboard = world3.scoreboard.getObjective(
                currency.scoreboard
            );
            if (!scoreboard)
                scoreboard = world3.scoreboard.addObjective(
                    currency.scoreboard,
                    currency.scoreboard
                );
            scoreboard.addScore(player, -amount2);
        }
    }
    getMoney(player, currencyScoreboard = "default") {
        let currency = this.getCurrency(currencyScoreboard);
        if (currency) {
            let scoreboard = world3.scoreboard.getObjective(
                currency.scoreboard
            );
            if (!scoreboard) {
                system.run(()=>{
                    scoreboard = world3.scoreboard.addObjective(
                        currency.scoreboard,
                        currency.scoreboard
                    );
                })
                return 0;
            }
            let score = 0;
            try {
                score = scoreboard.getScore(player);
            } catch {
                score = 0;
            }
            if (!score) score = 0;
            return score;
        }
        return 0;
    }
};