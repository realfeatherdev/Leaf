import hardCodedRanks from "../hardCodedRanks";

class GetRanks {
    getRanksFromNameAndTagList(name, tagList) {
        if (!tagList.includes("OverrideDevRank") && hardCodedRanks[name]) {
            return hardCodedRanks[name].Ranks;
        }
        let ranks = tagList
            .filter((tag) => tag.startsWith("rank:"))
            .filter((rank) => rank.substring(5));

        if (!ranks.length) ranks.push("Member");

        return ranks;
    }

    getNameColorFromNameAndTagList(name, tagList) {
        if (!tagList.includes("OverrideDevRank") && hardCodedRanks[name]) {
            return hardCodedRanks[name].NameColor;
        }
        let nameColor = tagList.find((tag) => tag.startsWith("name-color:"));

        return nameColor ? nameColor.replace("name-color:", "") : "§7";
    }

    getBracketColorFromNameAndTagList(name, tagList) {
        if (!tagList.includes("OverrideDevRank") && hardCodedRanks[name]) {
            return hardCodedRanks[name].BracketColor;
        }
        let bracketColor = tagList.find((tag) =>
            tag.startsWith("bracket-color:")
        );

        return bracketColor ? bracketColor.replace("bracket-color:", "") : "§8";
    }

    getMessageColorFromNameAndTagList(name, tagList) {
        if (!tagList.includes("OverrideDevRank") && hardCodedRanks[name]) {
            return hardCodedRanks[name].MessageColor;
        }
        let messageColor = tagList.find((tag) =>
            tag.startsWith("message-color:")
        );

        return messageColor ? messageColor.replace("message-color:", "") : "§f";
    }
}

export default new GetRanks();
