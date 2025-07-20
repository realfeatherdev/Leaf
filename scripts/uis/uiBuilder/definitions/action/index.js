import emojis from "../../../../api/emojis";
import uiBuilder from "../../../../api/uiBuilder";
import moment from '../../../../lib/moment'
uiBuilder.definitions.push({
    deftype: "ROOT",
    type: 0,
    name: "Action Form",
    getName(doc) {
        return doc.data.name
    },
    getSubtext(doc) {
        return `${emojis.clock} ${moment(doc.updatedAt).fromNow()} ${emojis.red_dot} ${doc.data.scriptevent.slice(0, 17)}${doc.data.scriptevent.length > 17 ? "..." : ""}`
    },
    extendEditButtons(actionForm, doc) {
    },
    defaultIcon: "textures/azalea_icons/other/node"
})