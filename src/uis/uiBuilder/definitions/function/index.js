import uiBuilder from "../../../../api/uiBuilder"

// dog (sequel)

uiBuilder.definitions.push({
    deftype: "ROOT",
    type: 16,
    name: "Function",
    getName(doc) {
        return doc.data.uniqueID
    },
    defaultIcon: "textures/azalea_icons/other/function"
})