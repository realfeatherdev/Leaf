import uiBuilder from "../../../../api/uiBuilder";
import customCommandButtons from "./customCommandButtons";
import moment from '../../../../lib/moment'
import emojis from "../../../../api/emojis";
import configAPI from "../../../../api/config/configAPI";

uiBuilder.definitions.push({
    deftype: "ROOT",
    type: 9,
    name: "Custom Command",
    getName(doc) {
        return doc.data.name
    },
    getSubtext(doc) {
        return `${emojis.clock} ${moment(doc.updatedAt).fromNow()} ${emojis.aqua_dot} ${configAPI.getProperty("Prefix")}${doc.data.command}`
    },
    defaultIcon: "textures/azalea_icons/other/node",
    ...customCommandButtons
})