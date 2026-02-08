import { system, world } from "@minecraft/server";
import icons from "../../api/icons";
import uiBuilder from "../../api/uiBuilder";
import config from "../../versionData";
import http from "../../networkingLibs/currentNetworkingLib";
import uiManager, { Button, UI } from "../../uiManager";
import * as _ from "../../api/iconViewer/underscore.js";
import moment from "../../lib/moment";
import emojis from "../../api/emojis";
import tabUI from "../../api/tabUI";
import './addSubmenu.js'
import './timer/edit.js'
import "./settings/root.js";
import './todo/root.js'
import './meta.js'
import { ActionForm, MessageForm, ModalForm } from "../../lib/form_func";
import "./snippetBook";
import "./trash";
import './definitions/index.js'
import "../devmode/root.js";
import {
    NUT_UI_ALT,
    NUT_UI_DISABLE_VERTICAL_SIZE_KEY,
    NUT_UI_DISBALE_BTN,
    NUT_UI_HEADER_BUTTON,
    NUT_UI_LEFT_HALF,
    NUT_UI_MODAL,
    NUT_UI_RIGHT_HALF,
    NUT_UI_TAG,
    NUT_UI_THEMED,
} from "../preset_browser/nutUIConsts";
import './voting/add.js'
import { themes } from "./cherryThemes";
import "./help/main.js";
import { prismarineDb } from "../../lib/prismarinedb.js";
import { formatStr } from "../../api/azaleaFormatting.js";
import configAPI from "../../api/config/configAPI.js";
import "./addViewSeparator.js";
import base64 from "../../api/uibuild/base64.js";
import "./toast/index.js";
import "./events/index.js";
import "./invites/index.js";
import eventsData from "../../data/eventsData.js";
import versionData from "../../versionData";
import { ChestFormData } from "../../lib/chestUI.js";
import playerStorage from "../../api/playerStorage.js";
// Create a tab UI for the builder
const builderTabUI = tabUI.create("uiBuilder");

uiManager.addUI(versionData.uiNames.BasicInfo, "FREFER", (player)=>{
    let modal = new ModalForm();
    modal.title("Basic Server Info");
    modal.textField("Server Name", "Edit your servers name...", configAPI.getProperty("ServerName2") == "Unknown Server" ? "" : configAPI.getProperty("ServerName2"), ()=>{})
    modal.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, versionData.uiNames.ConfigRoot)
        configAPI.setProperty("ServerName2", response.formValues[0])
        return uiManager.open(player, versionData.uiNames.ConfigRoot)
    })
})
// only god knows what ancient remnants you are going to find in here. take this bucket for emotional support 🪣

let folderColors = [
    {
        name: "Normal",
        texturePath: "textures/azalea_icons/Folders/FolderNormal",
    },
    {
        name: "White",
        // texturePath: "textures/folders/rainbow"
        texturePath: "textures/azalea_icons/Folders/FolderWhite",
    },
    {
        name: "Pink",
        texturePath: "textures/azalea_icons/Folders/FolderPink",
    },
    {
        name: "Blue",
        texturePath: "textures/azalea_icons/Folders/FolderBlue",
    },
    {
        name: "Cherry",
        texturePath: "textures/azalea_icons/Folders/FolderCherry",
    },
    {
        name: "Green",
        texturePath: "textures/azalea_icons/Folders/FolderGreen",
    },
];
uiManager.addUI(
    config.uiNames.UIBuilderFolders,
    "UI Builder Folders",
    (player) => {
        let form = new ActionForm();
        form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§rFolders`);
        form.button(
            `§aNew Folder\n§7Create a new folder`,
            `textures/azalea_icons/1`,
            (player) => {}
        );
        form.show(player, false, (player, response) => {});
        return;
        // world.sendMessage(JSON.stringify(prismarineDb.economy.getCurrency("default")))
        // let form = new ActionForm();
        // form.title(`UI Builder Folders`);
        // form.body(`Manage your folders here`);
        // form.button(`§aCreate Folder\n§r§7Create a new folder`, null, (player)=>{
        //     let modalForm = new ModalForm();
        //     modalForm.title(`Create Folder`);
        //     modalForm.textField("Folder Name", "Example: Utility UIs")
        //     modalForm.show(player, false, (player, response)  => {
        //         if(response.canceled || !response.formValues[0]) return uiManager.open(player, config.uiNames.UIBuilderFolders);
        //         uiBuilder.db.createFolder(response.formValues[0]);
        //         uiManager.open(player, config.uiNames.UIBuilderFolders);
        //     });
        // })
        // for(const folder of uiBuilder.db.getFolders()) {
        //     let folder2 = uiBuilder.db.folders.find(_=>_.name == folder);
        //     form.button(`${folder}`, folder2.color ? folderColors.find(_=>_.name == folder2.color) ? folderColors.find(_=>_.name == folder2.color).texturePath : "textures/azalea_icons/Folders/FolderNormal" : "textures/azalea_icons/Folders/FolderNormal", (player)=>{
        //         let actionForm = new ActionForm();
        //         actionForm.title(`${folder}`);
        //         actionForm.body(`Manage your folder here`);
        //         actionForm.button(`§aDelete Folder\n§r§7Delete the folder`, null, (player)=>{
        //             uiBuilder.db.deleteFolder(folder);
        //             uiManager.open(player, config.uiNames.UIBuilderFolders);
        //         })
        //         let uis = uiBuilder.db.getFolderDocuments(folder)
        //         if(uis.length) {
        //             actionForm.button(`§eExport`, null, (player)=>{
        //                 let data = {
        //                     version: '1.0',
        //                     exportSource: 'folder',
        //                     data: uis[0].data,
        //                     dependencies: uis.map(_=>_.data).slice(1)
        //                 }
        //                 let modal = new ModalForm();
        //                 modal.title('Code Editor')
        //                 modal.textField("Contents", "Contents", `${JSON.stringify(data)}`)
        //                 modal.show(player, false, (player, response)=>{
        //                     uiManager.open(player, config.uiNames.UIBuilderFolders)
        //                 })
        //             })
        //         }
        //         actionForm.button("§dEdit UIs\n§r§7Edit the UIs in the folder", null, (player)=>{
        //             let modalForm = new ModalForm();
        //             modalForm.title(`Edit UIs`);
        //             let uis = uiBuilder.getAllUIs();
        //             uis = uis.sort((a, b) => b.updatedAt - a.updatedAt);
        //             let dropdown = uis.map(ui => {
        //                 return {
        //                     name: ui.data.type == 4 ? ui.data.title : ui.data.name,
        //                     id: ui.id
        //                 }
        //             });
        //             let docs = uiBuilder.db.getFolderDocuments(folder);
        //             for(const ui of dropdown) {
        //                 modalForm.toggle(`${ui.name}`, docs.find(doc => doc.id == ui.id) ? true : false)
        //             }
        //             // modalForm.textField("UI Name", "Example: Utility UIs")
        //             modalForm.show(player, false, (player, response) => {
        //                 // if(response.canceled || !response.formValues[0]) return uiManager.open(player, config.uiNames.UIBuilderFolders);
        //                 // uiBuilder.db.add(folder, response.formValues[0]);
        //                 // uiManager.open(player, config.uiNames.UIBuilderFolders);

        //                 uiBuilder.db.folders.find(_=>_.name == folder).documentIDs = response.formValues.map((tf, i)=>response.formValues[i] ? dropdown[i].id : null).filter(id=>id)
        //                 uiBuilder.db.saveFolders();
        //                 uiManager.open(player, config.uiNames.UIBuilderFolders);
        //             });
        //         })
        //         actionForm.button(`§aChange Folder Color\n§r§7Change the folder color`, null, (player)=>{
        //             let newActionForm = new ActionForm();
        //             newActionForm.title(`Change Folder Color`);
        //             newActionForm.body(`Change the folder color`);
        //             for(const color of folderColors) {
        //                 newActionForm.button(`${color.name}`, color.texturePath, (player)=>{
        //                     uiBuilder.db.folders.find(_=>_.name == folder).color = color.name;
        //                     uiBuilder.db.saveFolders();
        //                     uiManager.open(player, config.uiNames.UIBuilderFolders);
        //                 })
        //             }
        //             newActionForm.show(player, false, () => {});
        //         });
        //         actionForm.show(player, false, () => {});
        //     })
        // }
        // form.show(player, false, () => {});
    }
);

uiManager.addUI(
    config.uiNames.UIBuilderFoldersView,
    "UI Builder Folders View",
    (player, folder) => {
        let form = new ActionForm();
        form.title(`${folder}`);
        form.button(`§cBack`, null, (player) => {
            uiManager.open(player, config.uiNames.UIBuilderRoot);
        });
        for (const ui of uiBuilder.getAllUIs()) {
            if (
                uiBuilder.db
                    .getFolderDocuments(folder)
                    .find((_) => _.id == ui.id)
            ) {
                form.button(
                    `§b${ui.data.name}\n§r§7${
                        emojis.chicken_with_spider_egg
                    } Updated ${moment(ui.updatedAt).fromNow()}`,
                    ui.data.icon
                        ? icons.resolve(ui.data.icon)
                        : ui.data.layout == 4
                        ? `textures/azalea_icons/DevSettingsClickyClick`
                        : `textures/azalea_icons/ClickyClick`,
                    (player) => {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderEdit,
                            ui.id
                        );
                    }
                );
            }
        }
        form.show(player, false, () => {});
    }
);
function getIcon(ui) {
    let definition = uiBuilder.definitions.find(_=>_.deftype == "ROOT" && _.type == ui.data.type)
    try {
        return ui.data.type == 15 ? `textures/azalea_icons/other/terrain` : ui.data.type == 13 ? `textures/azalea_icons/other/book` :
        ui.data.type ==14 ? ui.data.disabled ? `textures/items/zones_disabled` :  ui.data.isRef ? `textures/items/zones_ref` : `textures/items/zones` : ui.data.type == 11
        ? `textures/azalea_icons/send_req`
        : ui.id == 1719775088275
        ? `textures/ui/boykisser`
        : ui.data.icon
        ? icons.resolve(ui.data.icon)
        : ui.data.type == 2
        ? ui.data.isBox
            ? `textures/azalea_icons/other/package`
            : ui.data.isCocks ? `textures/coxes`
            : `textures/azalea_icons/other/folder`
        : ui.data.type == 12
        ? `textures/azalea_icons/other/location`
        : ui.data.type == 9
        ? `textures/azalea_icons/other/console`
        : ui.data.internal
        ? `textures/azalea_icons/LeafyClickOwO`
        : // : ui.data.layout == 4 ? `textures/azalea_icons/DevSettingsClickyClick`
        ui.data.layout == 4
        ? `textures/azalea_icons/other/glow`
        : ui.data.type == 6
        ? `textures/azalea_icons/other/information`
        : ui.data.type == 10
        ? `textures/azalea_icons/other/clock`
        : ui.data.type == 8
        ? `textures/azalea_icons/other/script_code`
        : ui.data.type == 7
        ? `textures/azalea_icons/other/text`
        : // : ui.data.type == 4 ? `textures/azalea_icons/ChestIcons/Chest${ui.data.rows ? ui.data.rows : 3}`
        ui.data.type == 4
        ? `textures/azalea_icons/other/inventory`
        : ui.data.type == 3
        ? `textures/azalea_icons/other/keyboard`
        : definition && definition.defaultIcon ? definition.defaultIcon
        : `textures/azalea_icons/other/node`;
    } catch {
        return `textures/azalea_icons/other/linux`
    }
}
function getBtnText(ui, hideSubtext = false) {
    try {
        let subtext = `${emojis.clock} ${moment(ui.updatedAt).fromNow()}`
        let definition = uiBuilder.definitions.find(_=>_.deftype == "ROOT" && _.type == ui.data.type)
        if(definition && definition.getSubtext) subtext = definition.getSubtext(ui)
        return `${
            ui.data.internal
                ? `§l§e§f§1§r§a`
                : ui.data.layout == 4
                ? "§c§h§e§1§r§c"
                : ui.data.type == 12
                ? `§a`
                : ui.data.type == 9
                ? `§v`
                : ui.data.type == 13 ? `§c`
                : ui.data.type == 14 ? `§6`
                : ui.data.type == 15 ? `§q`
                : "§e"
        }${
            ui.data.label ?
                `${ui.data.label}${ui.data.type != 13 ? ` ${emojis.green_thing}` : ``}`
                : ui.data.type == 15 ? ui.data.uniqueID
                : ui.data.type == 8
                ? ui.data.uniqueID
                : ui.data.type == 11
                ? `§bInvite: ${ui.data.identifier}`
                : ui.data.type == 10
                ? ui.data.label
                    ? ui.data.label
                    : `Event: ${eventsData[ui.data.eventType].name}`
                : ui.data.type == 4
                ? ui.data.title
                : definition && definition.getName ? definition.getName(ui)
                : ui.data.name
        }${ui.data.type == 6 ? " §r§7[§fTOAST§7] " : ui.data.type == 14 ? " §r§e[§6ZONE§e] " : ""}${
            ui.data.pinned && !ui.data.internal ? ` \uE174` : ""
        }${hideSubtext ? `` : `\n§r§7${subtext}`}`;    
    } catch {
        return "null";
    }
}

function showImportingStuff(player, data) {
    let logs = [];
}

let useNewImporting = false;

function handleImportingFlow(player, data2) {
    if (useNewImporting) {
        function error(msg) {
            player.error(msg);
            uiManager.open(player, versionData.uiNames.UIBuilderRoot);
        }
        let data = typeof data2 == "object" ? data2 : JSON.parse(data2);
        if (!data.type && typeof data.type != "number")
            return error("No 'type' value. Cancelling...");
        let schema = uiBuilder.schemas.get(data.type);
        if (schema) {
            player.sendMessage("schema found");
            try {
                let validation = schema.validate(data, { strict: true });
                let cast = schema.cast(data);
                showImportingStuff(player, cast);
                player.sendMessage("Schema validated!");
            } catch (e) {
                error(`UI did not match schema for UIType${data.type}`);
                showImportingStuff(player, data);
            }
        } else {
            player.sendMessage("schema not found");
        }
        return;
    }
    try {
        let dat = typeof data2 == "object" ? data2 : JSON.parse(data2);
        if (!dat.version) {
            if (dat.id && dat.updatedAt && dat.createdAt && dat.data) {
                // for compatibility with v3.0-beta UIs
                let data = dat.data;
                if (data.scriptevent || data.type != 0) {
                    if (
                        uiBuilder.db.findFirst({
                            scriptevent: data.scriptevent,
                        })
                    ) {
                        uiManager.open(
                            player,
                            config.uiNames.Basic.Confirmation,
                            `This UI already exists on your world. Are you sure you want to import this UI?`,
                            () => {
                                uiBuilder.db.insertDocument({
                                    ...data,
                                    importedBy: player.id,
                                    imported: true,
                                });
                                return uiManager.open(
                                    player,
                                    config.uiNames.UIBuilderRoot
                                );
                            },
                            () => {
                                return uiManager.open(
                                    player,
                                    config.uiNames.UIBuilderRoot
                                );
                            }
                        );
                    } else {
                        uiBuilder.db.insertDocument({
                            ...data,
                            importedBy: player.id,
                            imported: true,
                        });
                        return uiManager.open(
                            player,
                            config.uiNames.UIBuilderRoot
                        );
                    }
                } else {
                    player.error("Invalid UI data");
                    return uiManager.open(player, config.uiNames.UIBuilderRoot);
                }

                return;
            }
            if (dat.scriptevent || dat.type != 0) {
                if (uiBuilder.db.findFirst({ scriptevent: dat.scriptevent })) {
                    uiManager.open(
                        player,
                        config.uiNames.Basic.Confirmation,
                        `This UI already exists on your world. Are you sure you want to import this UI?`,
                        () => {
                            uiBuilder.db.insertDocument({
                                ...dat,
                                importedBy: player.id,
                                imported: true,
                            });
                            return uiManager.open(
                                player,
                                config.uiNames.UIBuilderRoot
                            );
                        },
                        () => {
                            return uiManager.open(
                                player,
                                config.uiNames.UIBuilderRoot
                            );
                        }
                    );
                } else {
                    uiBuilder.db.insertDocument({
                        ...dat,
                        importedBy: player.id,
                        imported: true,
                    });
                    return uiManager.open(player, config.uiNames.UIBuilderRoot);
                }
            } else {
                player.error("Invalid UI data");
                return uiManager.open(player, config.uiNames.UIBuilderRoot);
            }
            return;
        }
        let clashing = uiBuilder.db.findFirst({
            scriptevent: dat.ui.scriptevent,
        })
            ? [dat.ui.scriptevent]
            : [];
        if (dat.dependencies && dat.dependencies.length) {
            for (const dep of dat.dependencies) {
                if (uiBuilder.db.findFirst({ scriptevent: dep.scriptevent })) {
                    clashing.push(dep.scriptevent);
                }
            }
        }
        let showWarning = false;
        let warningMessage = [];
        if (clashing.length) {
            let types = {
                action: 0,
                modal: 0,
                chest: 0,
            };
            let typeMap = new Map([
                [0, "action"],
                [1, "action"],
                [3, "modal"],
                [4, "chest"],
            ]);
            for (const clash of clashing) {
                let ui = uiBuilder.db.findFirst({ scriptevent: clash });
                if (!typeMap.has(ui.data.type)) continue;
                types[typeMap.get(ui.data.type)] =
                    types[typeMap.get(ui.data.type)] + 1;
            }
            warningMessage.push(
                `§aThere are §e${
                    clashing.length
                } §aclashing UI scriptevent(s): §7${clashing.join("§r§f, §7")}`
            );
            warningMessage.push(`§bChest: §f${types.chest}`);
            warningMessage.push(`§aAction: §f${types.action}`);
            warningMessage.push(`§cModal: §f${types.modal}`);
            warningMessage.push(`\n`);
        }
        if (dat.dependencies && dat.dependencies.length) {
            let typeMap = new Map([
                [0, "action"],
                [1, "action"],
                [3, "modal"],
                [4, "chest"],
            ]);
            warningMessage.push(`This UI has multiple dependencies!`);
            for (const dep of dat.dependencies) {
                warningMessage.push(
                    `§a${dep.type == 4 ? dep.title : dep.name} §6(${typeMap.get(
                        dep.type
                    )})`
                );
            }
            warningMessage.push("\n");
        }
        if (warningMessage.length) {
            warningMessage.push("Are you sure you want to continue?");
            let messageForm = new MessageForm();
            messageForm.title("Continue?");
            messageForm.body(warningMessage.join("\n§r"));
            messageForm.button1("No", (player) => {
                uiBuilder.importUI(dat);
                uiManager.open(player, config.uiNames.UIBuilderRwwoot);
            });
            messageForm.button2("Yes", (player) => {
                uiManager.open(player, config.uiNames.UIBuilderRoot);
            });
            messageForm.show(player, false, (player, response) => {});
            return;
        }
        uiBuilder.importUI(dat);
        uiManager.open(player, config.uiNames.UIBuilderRoot);
    } catch (e) {
        player.error("Failed to import UI");
        player.error(`${e} ${e.stack}`);
        uiManager.open(player, config.uiNames.UIBuilderRoot);
    }
}

uiManager.addUI(
    config.uiNames.ImportUI,
    "Import a UI",
    (player, data = null) => {
        if (data) return handleImportingFlow(player, data);
        let modal = new ModalForm();
        modal.title("Code Editor");
        modal.textField("Code", "Code");
        modal.show(player, false, (player, response) => {
            if (response.canceled || !response.formValues[0]) {
                player.error("Canceled importing.");
                uiManager.open(player, config.uiNames.UIBuilderRoot);
            }
            handleImportingFlow(player, response.formValues[0]);
        });
    }
);
function buildFolderTree(parentId = null) {
    const folders = uiBuilder.db.findDocuments({ type: 2 });
    
    // Filter folders with the given parentId (null for root folders)
    const children = folders.filter(folder => {
        const parent = folder.data.folder || null;
        return parent === parentId;
    });

    // Recursively build the tree
    return children.map(folder => ({
        name: folder.data.name,
        id: folder.id,
        subfolders: buildFolderTree(folder.id)
    }));
}
function collectFolderPaths(folders, path = "", result = []) {
    for (const folder of folders) {
        const fullPath = path ? `${path} / ${folder.name}` : folder.name;
        result.push([fullPath, folder.id]);

        if (folder.subfolders.length > 0) {
            collectFolderPaths(folder.subfolders, fullPath, result);
        }
    }
    return result;
}
uiManager.addUI(
    config.uiNames.UIBuilderFolder,
    "yes",
    (player, folder, page = 0) => {
        let form = new ActionForm();
        let folderData = uiBuilder.db.getByID(folder);
        if (folderData.data.isBox == true) {
            let chest = new ChestFormData("meow");
            let sortedUIs = uiBuilder
                .getAllUIs()
                .filter((_) => !_.data.internal);
            sortedUIs = sortedUIs.filter((_) => _.data.folder == folder);
            let pages = _.chunk(sortedUIs, 2 * 9);
            if (!pages.length) pages.push([]);
            let pageCount = pages.length;
            chest.title(
                `§f${folderData.data.name} §f(${page + 1}/${pageCount})`
            );
            for (let i = 0; i < 9; i++) {
                // if([0,4,8])
                chest.button(
                    2 * 9 + i,
                    "§cX",
                    [],
                    "textures/ui/meow/chokinoncock",
                    1,
                    false,
                    () => {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderFolder,
                            folder,
                            page
                        );
                    }
                );
            }
            let pageData = pages[page];
            for (let i = 0; i < pageData.length; i++) {
                chest.button(
                    i,
                    getBtnText(pageData[i]),
                    [],
                    getIcon(pageData[i]),
                    1,
                    false,
                    () => {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderEdit,
                            pageData[i].id
                        );
                    }
                );
            }
            // console.warn(`meow meow meow!`);

            chest.button(
                2 * 9,
                "§bPrevious Page",
                ["§7Go to the previous page"],
                "textures/ui/meow/prev_package",
                1,
                false,
                () => {
                    // page =
                    // console.warn(`Page Count: ${pageCount}, Page: ${page}`);
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderFolder,
                        folder,
                        Math.max(0, page - 1)
                    );
                }
            );
            chest.button(
                2 * 9 + 8,
                "§bNext Page",
                ["§7Go to the next page"],
                "textures/ui/meow/next_package",
                1,
                false,
                () => {
                    // page =
                    // console.warn(`Page Count: ${pageCount}, Page: ${page}`);
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderFolder,
                        folder,
                        Math.min(pages.length - 1, page + 1)
                    );
                }
            );
            chest.button(
                2 * 9 + 3,
                "§cDelete Box",
                ["§7Delete the box :c"],
                `textures/azalea_icons/other/delete`,
                1,
                false,
                () => {
                    uiManager.open(
                        player,
                        config.uiNames.Basic.Confirmation,
                        "Are you sure you want to delete this box?\nIf you do you are not a good girl",
                        () => {
                            uiBuilder.db.deleteDocumentByID(folder);
                            uiManager.open(
                                player,
                                config.uiNames.UIBuilderRoot
                            );
                        },
                        () => {
                            uiManager.open(
                                player,
                                config.uiNames.UIBuilderFolder,
                                folder,
                                page
                            );
                        }
                    );
                }
            );

            chest.button(
                2 * 9 + 5,
                "§aAdd to Box",
                ["§7Add a UI to the box!"],
                `textures/azalea_icons/other/add`,
                1,
                false,
                () => {
                    let newForm = new ActionForm();
                    newForm.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§rAdd UI To Folder`);
                    newForm.button(
                        `${NUT_UI_HEADER_BUTTON}§r§cGo back`,
                        `textures/azalea_icons/2`,
                        (player) => {
                            uiManager.open(
                                player,
                                config.uiNames.UIBuilderFolder,
                                folder,
                                page
                            );
                        }
                    );
                    const sortedUIs = uiBuilder
                        .getAllUIs()
                        .sort((a, b) => {
                            const aValue = a.data.pinned || false;
                            const bValue = b.data.pinned || false;
                            if (aValue !== bValue) {
                                return bValue ? 1 : -1;
                            }
                            return b.updatedAt - a.updatedAt;
                        })
                        .filter((_) => !_.data.internal);
                    for (const ui of sortedUIs) {
                        if (
                            ui.data.folder &&
                            uiBuilder.db.getByID(ui.data.folder)
                        )
                            continue;
                        newForm.button(
                            getBtnText(ui),
                            getIcon(ui),
                            (player) => {
                                uiBuilder.setFolder(
                                    ui.id,
                                    folderData.data.name
                                );
                                uiManager.open(
                                    player,
                                    config.uiNames.UIBuilderFolder,
                                    folder,
                                    page
                                );
                            }
                        );
                    }

                    newForm.show(player, false, (player, response) => {});
                }
            );
            chest.show(player).then(() => {});
            return;
        }
        form.title(`${!folderData.data.isCocks ? `${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§r` : ``}${folderData.data.name}`);
        form.button(
            `${NUT_UI_HEADER_BUTTON}§r§cGo back`,
            `textures/azalea_icons/2`,
            (player) => {
                uiManager.open(player, folderData.data.folder && uiBuilder.db.getByID(folderData.data.folder) ? config.uiNames.UIBuilderFolder : config.uiNames.UIBuilderRoot, folderData.data.folder && uiBuilder.db.getByID(folderData.data.folder) ? folderData.data.folder : null);
            }
        );
        form.button(
            `${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§r§aAdd UI\n§7Add a UI to the folder`,
            null,
            (player) => {
                let newForm = new ActionForm();
                newForm.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§rAdd UI To Folder`);
                newForm.button(
                    `${NUT_UI_HEADER_BUTTON}§r§cGo back`,
                    `textures/azalea_icons/2`,
                    (player) => {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderFolder,
                            folder
                        );
                    }
                );
                const sortedUIs = uiBuilder
                    .getAllUIs()
                    .sort((a, b) => {
                        const aValue = a.data.pinned || false;
                        const bValue = b.data.pinned || false;
                        if (aValue !== bValue) {
                            return bValue ? 1 : -1;
                        }
                        return b.updatedAt - a.updatedAt;
                    })
                    .filter((_) => !_.data.internal);
                for (const ui of sortedUIs) {
                    if (ui.data.folder && uiBuilder.db.getByID(ui.data.folder))
                        continue;
                    newForm.button(getBtnText(ui), getIcon(ui), (player) => {
                        uiBuilder.setFolder(ui.id, folderData.data.name);
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderFolder,
                            folder
                        );
                    });
                }
                newForm.show(player, false, (player, response) => {});
            }
        );
        form.button(
            `${NUT_UI_LEFT_HALF}§r§eSet Icon\n§7Set the icon`,
            getIcon(folderData),
            (player) => {
                uiManager.open(
                    player,
                    config.uiNames.IconViewer,
                    0,
                    (player, iconID) => {
                        if (iconID !== null) {
                            folderData.data.icon = iconID;
                            uiBuilder.db.overwriteDataByID(
                                folderData.id,
                                folderData.data
                            );
                        }
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderFolder,
                            folder
                        );
                    }
                );
            }
        );
        /*
        defaultTitle = undefined,
        defaultBody = undefined,
        defaultScriptevent = undefined,
        error = undefined,
        id = undefined,
        folder = undefined
        */
        form.button(`§bCreate UI\n§7Create a UI in this folder`, `textures/azalea_icons/1`, (player)=>{
            uiManager.open(player, versionData.uiNames.UIBuilderAdd, undefined, undefined, undefined, undefined, undefined, folder)
        })
        form.button(
            `§vExport Folder\n§7Get code for all UIs in this folder`,
            null,
            (player) => {
                let uis = uiBuilder.db.findDocuments({folder}).filter(_=>_.data.type != 2);
                let folders = collectFolderPaths(buildFolderTree(folder));
                for(const folder of folders) {
                    for(const ui of uiBuilder.db.findDocuments({folder: folder[1]})) {
                        if(ui.data.type == 2) continue;
                        uis.push(ui)
                    }
                }
                if(!uis.length) {
                    player.error(`This folder has no contents`)
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderFolder,
                        folder
                    );
                }

                let data = {
                    version: "1.0",
                    timestamp: Date.now(),
                    exportSource: "folder",
                    ui: uis[0].data,
                    dependencies: uis.slice(1).map((_) => _.data),
                };
                let modalForm = new ModalForm();
                modalForm.title(`Code Editor`);
                modalForm.textField("yes", "Code", JSON.stringify(data));
                modalForm.show(player, false, (player, response) => {
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderFolder,
                        folder
                    );
                });
            }
        );
        form.divider();
        let folders = uiBuilder.db.findDocuments({type: 2, folder});
        for(const folder of folders) {
            form.button(`§d${folder.data.name}\n§7Click to open subfolder`, getIcon(folder), (player)=>{
                uiManager.open(player, config.uiNames.UIBuilderFolder, folder.id)
            })
        }
        let sortedUIs = uiBuilder
            .getAllUIs()
            .sort((a, b) => {
                const aValue = a.data.pinned || false;
                const bValue = b.data.pinned || false;
                if (aValue !== bValue) {
                    return bValue ? 1 : -1;
                }
                return b.updatedAt - a.updatedAt;
            })
            .filter((_) => !_.data.internal);
        sortedUIs = sortedUIs.filter((_) => _.data.folder == folder);
        if(folders.length && sortedUIs.length) form.divider();
        for (const ui of sortedUIs) {
            form.button(getBtnText(ui), getIcon(ui), (player) => {
                uiManager.open(player, config.uiNames.UIBuilderEdit, ui.id);
            });
        }
        form.divider();
        form.button(`§cDelete\n§7Delete this folder`, null, (player) => {
            uiManager.open(
                player,
                config.uiNames.Basic.Confirmation,
                "Are you sure you want to delete this folder?",
                () => {
                    uiBuilder.db.deleteDocumentByID(folder);
                    uiManager.open(player, folderData.data.folder && uiBuilder.db.getByID(folderData.data.folder) ? config.uiNames.UIBuilderFolder : config.uiNames.UIBuilderRoot, folderData.data.folder && uiBuilder.db.getByID(folderData.data.folder) ? folderData.data.folder : null);
                },
                () => {
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderFolder,
                        folder
                    );
                }
            );
        });
        form.button(`§aAdd subfolder\n§7Move a existing folder inside this folder`, null, (player) => {
            let form2 = new ActionForm();
            form2.title("Move into Folder")
            let folders = collectFolderPaths(buildFolderTree());
            for(const folder2 of folders) {
                if(folder2[1] == folder) continue;
                form2.button(`${folder2[0]}`, getIcon(uiBuilder.db.getByID(folder2[1])), (player)=>{
                    let folder3 = uiBuilder.db.getByID(folder2[1]);
                    folder3.data.folder = folder;
                    uiBuilder.db.overwriteDataByID(folder3.id, folder3.data); 
                    uiManager.open(player, versionData.uiNames.UIBuilderFolder, folder);
                })
            }
            form2.show(player, false, (player, response)=>{})
        });
        form.button(`§bCreate subfolder\n§7Create a folder in this folder`, null, (player) => {
            let modalForm = new ModalForm();
            modalForm.title(`${NUT_UI_MODAL}Create Folder`);
            modalForm.textField("Name", "Name");
            modalForm.show(player, false, (player, response) => {
                if (response.canceled)
                    return uiManager.open(
                        player,
                        config.uiNames.UIBuilderRoot
                    );
                uiBuilder.createFolder(response.formValues[0], folder);
                return uiManager.open(
                    player,
                    config.uiNames.UIBuilderFolder, folder
                );
            });
        });
        form.show(player, false, (player, response) => {});
    }
);
uiManager.addUI(config.uiNames.UIBuilderLeaf, "a", (player) => {
    let root = new ActionForm();
    root.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[5][0]}§rEdit Leaf GUIs`);
    let uis = uiBuilder.db.findDocuments({ internal: true });
    root.button(
        `${NUT_UI_HEADER_BUTTON}§r§cGo Back\n§7Go back fr`,
        `textures/azalea_icons/2`,
        (player) => {
            uiManager.open(player, config.uiNames.UIBuilderRoot);
        }
    );
    for (const ui of uis) {
        console.warn(ui.data.scriptevent)
        root.button(getBtnText(ui), getIcon(ui), (player) => {
            uiManager.open(player, config.uiNames.UIBuilderEdit, ui.id);
        });
    }
    root.show(player, false, (player, response) => {});
});
// Main UIs tab
uiManager.registerBuilder(config.uiNames.UIBuilderRoot, (player) => {
    const ui = new UI()
        .setCherryUI(true)
        .setCherryUITheme(68)
        .setTitle("Customizer");

    let doc = uiBuilder.db.findFirst({type: 2048});
    if(doc) {
        let tasks = doc.data.tasks.filter(_=>{
            if(!_.private) return true;
            return playerStorage.getID(player) == _.creator;
        }).filter(_=>_.completed == false);
        if(tasks.length > 0) {
            ui.addLabel(`§rYou have got §c${tasks.length} uncompleted §ftasks! Check the §btodo page.`)

        }
    }
    // Core actions
    ui.addButton(
        new Button()
            .setText(
                `${configAPI.getProperty("CustomizerCornerAdd") ? NUT_UI_HEADER_BUTTON : ""}§r§l§e§f§1§r§r§aNew creation\n§r§7Make a new creation`
            )
            .setIcon("textures/azalea_icons/other/add")
            .setCallback((player) =>
                uiManager.open(player, config.uiNames.UIBuilderAddSubmenu)
            )
    );

    ui.addButton(
        new Button()
            .setText(`${NUT_UI_HEADER_BUTTON}§r§vSettings\n§7Configure misc settings within customizer. Idk either tbqh`)
            .setIcon("textures/items/config_ui")
            .setCallback((player) =>
                uiManager.open(player, versionData.uiNames.CustomizerSettings)
            )
    );

    // ui.addButton(
    //     new Button()
    //         .setText(`${NUT_UI_HEADER_BUTTON}§r§dZones\n§7Configure special zones on your server, along with permissions inside of them.`)
    //         .setIcon("textures/azalea_icons/other/location")
    //         .setCallback((player) =>
    //             uiManager.open(player, versionData.uiNames.Zones.Root)
    //         )
    // );

    // ui.addButton(
    //     new Button()
    //         .setText(`${NUT_UI_HEADER_BUTTON}§r§eChat Ranks\n§7Edit this servers chat ranks configuration`)
    //         .setIcon("textures/azalea_icons/other/dialogue")
    //         .setCallback((player) =>
    //             uiManager.open(player, versionData.uiNames.ChatRanks.Main)
    //         )
    // );

    // ui.addButton(
    //     new Button()
    //         .setText(`${NUT_UI_HEADER_BUTTON}§r§cRole Editor\n§7Edit permissions on your server with ease`)
    //         .setIcon("textures/items/lock")
    //         .setCallback((player) =>
    //             uiManager.open(player, versionData.uiNames.RoleEditor.Root)
    //         )
    // );

    // ui.addButton(
    //     new Button()
    //         .setText(`${NUT_UI_HEADER_BUTTON}§r§nCommunity Hub\n§7View community presets and some official guides!\n§7Visit §ehttps://leaf.trashdev.org §7for full docs`)
    //         .setIcon("textures/minidevs/gay")
    //         .setCallback((player) =>
    //             uiManager.open(player, versionData.uiNames.Help)
    //         )
    // );

    // ui.addButton(
    //     new Button()
    //         .setText(`${NUT_UI_HEADER_BUTTON}§r§7Attach to item`)
    //         .setIcon("textures/azalea_icons/other/attach")
    //         .setCallback((player) =>
    //             uiManager.open(player, versionData.uiNames.Help)
    //         )
    // );

    ui.addButton(
        new Button()
            .setText(`${NUT_UI_HEADER_BUTTON}§r§bTODO\n§7Create lists of tasks you need to do in customizer.\n§7Leaf will §eremind §7you of those tasks at the top of the ${formatStr("{{gay \"Customizer\"}}")} §r§7UI.`)
            .setIcon("textures/azalea_icons/other/credits")
            .setCallback((player) =>
                uiManager.open(player, versionData.uiNames.UIBuilderTodo.Root)
            )
    );

    // ui.addButton(new Button()
    //     .setText(`${NUT_UI_HEADER_BUTTON}§r§bFilter by tags\n§7Tags :D`)
    //     .setIcon("textures/azalea_icons/other/tag_blue"));

    // ui.addButton(new Button()
    //     .setText(`${NUT_UI_HEADER_BUTTON}§r§dLibrary\n§7Folder groups?`)
    //     .setIcon("textures/azalea_icons/other/node_library"));

    // Online GUIs
    if (http.player) {
        ui.addButton(
            new Button()
                .setText(`§aBrowse\n§r§7Browse global GUIs`)
                .setIcon(icons.resolve("Packs/Asteroid/global"))
                .setCallback((player) => {
                    http.makeRequest(
                        {
                            method: "get",
                            url: `${config.Endpoint}/guis/list`,
                        },
                        (status, data) => {
                            system.run(() => {
                                uiManager.open(
                                    player,
                                    config.uiNames.OnlineGUIsList,
                                    data,
                                    "main"
                                );
                            });
                        }
                    );
                })
        );
    }

    // Dev mode CTX switcher
    if (
        !configAPI.getProperty("DevMode") &&
        !!configAPI.getProperty("DevMode")
    ) {
        ui.addButton(
            new Button()
                .setText(`§cDev: Switch CTX`)
                .setIcon("textures/update_pings_icons/main-settings/extraTools")
                .setCallback((player) => {
                    let modal = new ModalForm();
                    modal.title("UI Builder: Switch CTX");
                    modal.textField("Table Name", "Yes", uiBuilder.db.table);
                    modal.show(player, false, (player, response) => {
                        if (response.canceled || !response.formValues[0])
                            return uiManager.open(
                                player,
                                config.uiNames.UIBuilderRoot
                            );
                        uiBuilder.db
                            .switchTable(response.formValues[0])
                            .then(() => {
                                uiManager.open(
                                    player,
                                    config.uiNames.UIBuilderRoot
                                );
                            });
                    });
                })
        );
    }
    // ——— FOLDERS ——— //
    const folders = uiBuilder.db.findDocuments({ type: 2 });
    if (folders.filter((_) => _.data.isBox).length) ui.addLabel("§vBoxes:");
    for (const folder of folders) {
        if (!folder.data.isBox) continue;
        ui.addButton(
            new Button()
                .setText(`§v${folder.data.name}\n§7Click to open box`)
                .setIcon(getIcon(folder))
                .setCallback((player) => {
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderFolder,
                        folder.id
                    );
                })
        );
    }

    if (folders.filter((_) => _.data.isCocks).length) ui.addLabel("§6Car§erot§as");
    for (const folder of folders) {
        if (!folder.data.isCocks) continue;
        ui.addButton(
            new Button()
                .setText(`§3${folder.data.name}\n§7Click to open carrot`)
                .setIcon(getIcon(folder))
                .setCallback((player) => {
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderFolder,
                        folder.id
                    );
                })
        );
    }


    if (folders.filter((_) => !_.data.isBox && !_.data.isCocks).length) ui.addLabel("§6Folders:");
    for (const folder of folders) {
        if (folder.data.isBox) continue;
        if (folder.data.isCocks) continue;
        if (folder.data.folder && uiBuilder.db.getByID(folder.data.folder)) continue;
        let itemCount = uiBuilder.db.findDocuments({folder: folder.id}).filter(_=>_.data.type != 2).length;
        let subfolderCount = uiBuilder.db.findDocuments({folder: folder.id, type: 2}).length;
        let subtext = `${itemCount > 0 ? `${itemCount} creation${itemCount == 1 ? "" : "s"}` : ``}${subfolderCount > 0 ? `${itemCount > 0 ? ", " : ""}${subfolderCount} subfolder${subfolderCount == 1 ? "" : "s"}` : ``}`
        ui.addButton(
            new Button()
                .setText(`§6${folder.data.name}\n§7${subtext.length ? subtext : `No Contents`}`)
                .setIcon(getIcon(folder))
                .setCallback((player) => {
                    uiManager.open(
                        player,
                        config.uiNames.UIBuilderFolder,
                        folder.id
                    );
                })
        );
    }

    // ——— CREATIONS ——— //
    const sortedUIs = uiBuilder
        .getAllUIs()
        .sort((a, b) => {
            const aPinned = a.data.pinned || false;
            const bPinned = b.data.pinned || false;
            if (aPinned !== bPinned) return bPinned ? 1 : -1;
            return b.updatedAt - a.updatedAt;
        })
        .filter(
            (ui) =>
                !ui.data.internal &&
                (!ui.data.folder || !uiBuilder.db.getByID(ui.data.folder))
        );

    if (sortedUIs.length) ui.addLabel("§dCreations:");
    for (const entry of sortedUIs) {
        ui.addButton(
            new Button()
                .setText(getBtnText(entry))
                .setIcon(getIcon(entry))
                .setCallback((player) => {
                    if (entry.id === 1719775088275) {
                        const form = new ActionForm()
                            .title("Nuh uh")
                            .body(
                                "Trashy no no want u to edit this because she is a trashy girl :3"
                            )
                            .button("ok", null, () => {
                                uiManager.open(
                                    player,
                                    config.uiNames.UIBuilderRoot
                                );
                            });
                        form.show(player, false, () => {});
                    } else {
                        uiManager.open(
                            player,
                            config.uiNames.UIBuilderEdit,
                            entry.id
                        );
                    }
                })
        );
    }

    // ——— FOOTER BUTTONS ——— //
    ui.addDivider();

    ui.addButton(
        new Button()
            .setText(`§r§l§e§f§1§r§aLeaf GUIs\n§7Edit leaf's UIs`)
            .setIcon("textures/azalea_icons/other/package")
            .setCallback((player) =>
                uiManager.open(player, config.uiNames.UIBuilderLeaf)
            )
    );

    ui.addButton(
        new Button()
            .setText(
                `${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§r§aImport\n§r§7Import a UI`
            )
            .setIcon("textures/azalea_icons/other/anvil_in")
            .setCallback((player) =>
                uiManager.open(player, config.uiNames.ImportUI)
            )
    );

    ui.addButton(
        new Button()
            .setText(`${NUT_UI_LEFT_HALF}§r§6Trash\n§r§7View trash`)
            .setIcon("textures/azalea_icons/other/delete")
            .setCallback((player) =>
                uiManager.open(player, config.uiNames.UIBuilderTrash)
            )
    );

    return ui;
});

let showUI = (player) => {
    const buttons = [
        {
            text: `${NUT_UI_HEADER_BUTTON}§r§l§e§f§1§r§r§fNew creation\n§r§7Make a new creation`,
            iconPath: `textures/azalea_icons/other/add`,
            callback: (player) => {
                uiManager.open(player, config.uiNames.UIBuilderAddSubmenu);
            },
        },
    ];
    buttons.push({
        text: `${NUT_UI_HEADER_BUTTON}§r§vSettings`,
        iconPath: `textures/azalea_icons/Settings`,
        callback(player) {
            uiManager.open(player, versionData.uiNames.CustomizerSettings);
        },
    });
    buttons.push({
        text: `${NUT_UI_HEADER_BUTTON}§r§bFilter by tags\n§7Tags :D`,
        iconPath: `textures/azalea_icons/other/tag_blue`,
        callback(player) {},
    });
    buttons.push({
        text: `${NUT_UI_HEADER_BUTTON}§r§dLibrary\n§7Folder groups?`,
        iconPath: `textures/azalea_icons/other/node_library`,
        callback() {},
    });
    if (http.player) {
        buttons.push({
            text: `§aBrowse\n§r§7Browse global GUIs`,
            iconPath: icons.resolve("Packs/Asteroid/global"),
            callback: (player) => {
                http.makeRequest(
                    {
                        method: "get",
                        url: `${config.Endpoint}/guis/list`,
                    },
                    (status, data) => {
                        system.run(() => {
                            uiManager.open(
                                player,
                                config.uiNames.OnlineGUIsList,
                                data,
                                "main"
                            );
                        });
                    }
                );
            },
        });
    }
    if (
        !configAPI.getProperty("DevMode") &&
        !!configAPI.getProperty("DevMode")
    ) {
        buttons.push({
            text: `§cDev: Switch CTX`,
            iconPath: `textures/update_pings_icons/main-settings/extraTools`,
            callback: (player) => {
                let modal = new ModalForm();
                modal.title("UI Builder: Switch CTX");
                modal.textField("Table Name", "Yes", uiBuilder.db.table);
                modal.show(player, false, (player, response) => {
                    if (response.canceled || !response.formValues[0])
                        return uiManager.open(
                            player,
                            config.uiNames.UIBuilderRoot
                        );

                    uiBuilder.db
                        .switchTable(response.formValues[0])
                        .then(() => {
                            return uiManager.open(
                                player,
                                config.uiNames.UIBuilderRoot
                            );
                        });
                });
            },
        });
    }
    // buttons.push({
    //     text: `§aFolders\n§r§7Manage folders`,
    //     iconPath: `textures/azalea_icons/Folders/FolderNormal`,
    //     callback: (player) => {
    //         uiManager.open(player, config.uiNames.UIBuilderFolders);
    //     }
    // });
    if (uiBuilder.db.findDocuments({ type: 2 }).length) {
        buttons.push({ type: "LABEL", text: "§6Folders:" });
    }
    for (const folder of uiBuilder.db.findDocuments({ type: 2 })) {
        // let itemCount = uiBuilder.db.findDocuments({folder: folder.id})
        // let folderCount = uiBuilder.db.findDocuments({type: })
        buttons.push({
            // text: `§6${folder.data.name}\n§7Subfolder, ${}`,
            iconPath: getIcon(folder),
            callback: (player) => {
                uiManager.open(
                    player,
                    config.uiNames.UIBuilderFolder,
                    folder.id
                );
            },
        });
        continue;
        let folder2 = uiBuilder.db.folders.find((_) => _.name == folder);
        buttons.push({
            text: `§a${folder}\n§r§7Manage folder`,
            iconPath: folder2.color
                ? folderColors.find((_) => _.name == folder2.color)
                    ? folderColors.find((_) => _.name == folder2.color)
                          .texturePath
                    : "textures/azalea_icons/Folders/rainbow"
                : "textures/azalea_icons/Folders/rainbow",
            callback: (player) => {
                uiManager.open(
                    player,
                    config.uiNames.UIBuilderFoldersView,
                    folder
                );
            },
        });
    }

    // Add browse button if http player is available

    if (uiBuilder.db.findDocuments({ type: 2 }).length) {
        buttons.push({ type: "LABEL", text: "§dCreations:" });
    }
    // Add UI list buttons
    // const sortedUIs = uiBuilder.getUIs().sort((a, b) => b.updatedAt - a.updatedAt);
    const sortedUIs = uiBuilder
        .getAllUIs()
        .sort((a, b) => {
            const aValue = a.data.pinned || false;
            const bValue = b.data.pinned || false;
            if (aValue !== bValue) {
                return bValue ? 1 : -1;
            }
            return b.updatedAt - a.updatedAt;
        })
        .filter((_) => !_.data.internal);
    // sortedUIs.push(...uiBuilder.getModalUIs())
    sortedUIs.forEach((ui) => {
        if (ui.data.folder && uiBuilder.db.getByID(ui.data.folder)) return;
        // const scriptEventInfo = ui.data.scriptevent.length <= 16 && !ui.data.pinned
        //     ? ` §f| §7${emojis.chat} ${ui.data.scriptevent}`
        //     : '';
        // const scriptEventInfo = ` §r§f${formatStr("<dra>")} §r${ui.data.type == 0 ? ui.data.layout == 4 ? "§cCherryUI" : "§aAction" : ui.data.type == 3 ? "§dModal" : ui.data.type == 4 ? "§6Chest" : "§7Unknown"}`
        const scriptEventInfo = "";
        buttons.push({
            text: getBtnText(ui),
            iconPath: getIcon(ui),
            callback: (player) => {
                if (ui.id == 1719775088275) {
                    let form2 = new ActionForm();
                    form2.title(`Nuh uh`);
                    form2.body(
                        `Trashy no no want u to edit this because she is a trashy girl :3`
                    );
                    form2.button("ok", null, (player) => {
                        uiManager.open(player, config.uiNames.UIBuilderRoot);
                    });
                    form2.show(player, false, () => {});
                } else {
                    uiManager.open(player, config.uiNames.UIBuilderEdit, ui.id);
                }
            },
        });
    });

    buttons.push({ type: "DIVIDER" });

    buttons.push({
        text: `§r§l§e§f§1§r§aLeaf GUIs\n§7Edit leaf's UIs`,
        iconPath: `textures/azalea_icons/other/package`,
        callback: (player) => {
            uiManager.open(player, config.uiNames.UIBuilderLeaf);
        },
    });
    buttons.push({
        text: `${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§r§aImport\n§r§7Import a UI`,
        iconPath: `textures/azalea_icons/other/anvil_in`,
        callback: (player) => {
            uiManager.open(player, config.uiNames.ImportUI);
        },
    });
    buttons.push({
        text: `${NUT_UI_LEFT_HALF}§r§6Trash\n§r§7View trash`,
        iconPath: `textures/azalea_icons/other/delete`,
        callback: (player) => {
            uiManager.open(player, config.uiNames.UIBuilderTrash);
        },
    });

    // buttons.push({type:"DIVIDER"})
    // buttons.push({type:"LABEL", text: "§7Leaf Customizer v3.0"})
    // buttons.push({type:"LABEL", text: "§7Made with §v<3 §r§7by §6TrashyDaFox"})

    return {
        buttons,
    };
};
world.beforeEvents.itemUse.subscribe((e) => {
    // world.sendMessage(`${e.source.isOp()}`)
    // return;
    if (!prismarineDb.permissions.hasPermission(e.source, "creator-item"))
        return;
    if (e.itemStack.typeId == "leaf:customizer") {
        e.cancel = true;
        system.run(() => {
            uiManager.open(e.source, config.uiNames.UIBuilderRoot, true);
        });
    }
});
// Update the UI registration to use the tab UI
// uiManager.addUI(config.uiNames.UIBuilderRoot, "UI Builder Root", (player, hideBackButton = false) => {
//     let form = new ActionForm();
//     if(!hideBackButton) form.button(`${NUT_UI_HEADER_BUTTON}§r§cGo Back\n§7Go back to main settings`, `textures/azalea_icons/2`, player => uiManager.open(player, config.uiNames.ConfigRoot))
//     // form.button(`${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}${NUT_UI_ALT}${themes[38][0]}§rMy Creations`, null, (player)=>{
//     //     uiManager.open(player, config.uiNames.UIBuilderRoot)
//     // })
//     // form.button(`${NUT_UI_LEFT_HALF}${themes[0][0]}§rTab UIs (LEGACY)`, null, (player)=>{
//     //     uiManager.open(player, config.uiNames.UIBuilderTabbed)
//     // })

//     form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[38][0]}§rCustomizer`)
//     let { buttons } = showUI(player);
//     for(const button of buttons) {
//         if(button.type == "DIVIDER") {
//             form.divider()
//             continue;
//         }
//         if(button.type == "LABEL") {
//             form.label(button.text)
//             continue;
//         }
//         form.button(button.text, button.iconPath, button.callback)
//     }
//     form.show(player, false, (player, response)=>{

//     })
//     // builderTabUI.open(player);
// });

export { builderTabUI };
