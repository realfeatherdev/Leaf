import { world as world3 } from '@minecraft/server'

export class Economy {
    #table;

    constructor(table) {
        this.#table = table;

        this.#table.waitLoad().then(() => {
            const defaultCurrency = this.#table.findFirst({
                type: "CURRENCY",
                default: true,
            });

            if (!defaultCurrency) {
                system.run(() => {
                    try {
                        if (!world3.scoreboard.getObjective("money")) {
                            world3.scoreboard.addObjective("money", "money");
                        }
                    } catch {}
                });

                this.#table.insertDocument({
                    type: "CURRENCY",
                    default: true,
                    symbol: "$",
                    scoreboard: "money",
                    displayName: "Coins",
                    itemID: undefined,
                });
            }
        });
    }

    getTable() {
        return this.#table;
    }

    getCurrencies() {
        return [...this.#table.findDocuments({ type: "CURRENCY" })]
            .map(doc => doc.data);
    }

    getCurrency(scoreboard = "default") {
        if (scoreboard === "default") {
            const doc = this.#table.findFirst({
                type: "CURRENCY",
                default: true,
            });
            return doc ? doc.data : null;
        }

        return (
            this.#table.findFirst({ type: "CURRENCY", scoreboard })?.data ??
            this.#table.findFirst({ type: "CURRENCY", default: true })?.data ??
            null
        );
    }

    addCurrency(scoreboard, symbol, displayName, itemID) {
        const doc = this.#table.findFirst({
            type: "CURRENCY",
            scoreboard,
        });

        if (!doc) {
            this.#table.insertDocument({
                type: "CURRENCY",
                scoreboard,
                symbol,
                displayName,
                itemID,
            });
        }

        system.run(() => {
            try {
                if (!world3.scoreboard.getObjective(scoreboard)) {
                    world3.scoreboard.addObjective(scoreboard, scoreboard);
                }
            } catch {}
        });
    }

    deleteCurrency(scoreboard) {
        const doc = this.#table.findFirst({
            type: "CURRENCY",
            scoreboard,
        });

        if (doc) {
            this.#table.deleteDocumentByID(doc.id);
        }
    }

    editSymbol(scoreboard, symbol) {
        this.#edit(scoreboard, data => data.symbol = symbol);
    }

    editDisplayName(scoreboard, displayName) {
        this.#edit(scoreboard, data => data.displayName = displayName);
    }

    editScoreboard(scoreboard, newScoreboard) {
        this.#edit(scoreboard, data => data.scoreboard = newScoreboard);
    }

    editItemID(scoreboard, itemID) {
        this.#edit(scoreboard, data => data.itemID = itemID);
    }

    #edit(scoreboard, mutator) {
        const doc = this.#table.findFirst({
            type: "CURRENCY",
            scoreboard,
        });

        if (!doc) return;
        mutator(doc.data);
        this.#table.overwriteDataByID(doc.id, doc.data);
    }

    addMoney(player, amount, currencyScoreboard = "default") {
        this.#assertAmount(amount);
        this.#modifyMoney(player, amount, currencyScoreboard);
    }

    removeMoney(player, amount, currencyScoreboard = "default") {
        this.#assertAmount(amount);
        this.#modifyMoney(player, -amount, currencyScoreboard);
    }

    setMoney(player, amount, currencyScoreboard = "default") {
        this.#assertAmount(amount);

        const currency = this.getCurrency(currencyScoreboard);
        if (!currency) return;

        let obj = world3.scoreboard.getObjective(currency.scoreboard);
        if (!obj) {
            obj = world3.scoreboard.addObjective(
                currency.scoreboard,
                currency.scoreboard
            );
        }

        obj.setScore(player, amount);
    }

    getMoney(player, currencyScoreboard = "default") {
        const currency = this.getCurrency(currencyScoreboard);
        if (!currency) return 0;

        let obj = world3.scoreboard.getObjective(currency.scoreboard);
        if (!obj) {
            system.run(() => {
                try {
                    world3.scoreboard.addObjective(
                        currency.scoreboard,
                        currency.scoreboard
                    );
                } catch {}
            });
            return 0;
        }

        try {
            return obj.getScore(player) ?? 0;
        } catch {
            return 0;
        }
    }

    #assertAmount(amount) {
        if (typeof amount !== "number") {
            throw new Error("Amount must be number!");
        }
        if (amount < 0) {
            throw new Error("Amount must be positive");
        }
    }

    #modifyMoney(player, delta, currencyScoreboard) {
        const currency = this.getCurrency(currencyScoreboard);
        if (!currency) return;

        let obj = world3.scoreboard.getObjective(currency.scoreboard);
        if (!obj) {
            obj = world3.scoreboard.addObjective(
                currency.scoreboard,
                currency.scoreboard
            );
        }

        obj.addScore(player, delta);
    }
}
