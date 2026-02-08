import { system, world } from "@minecraft/server";
import { ActionForm, ModalForm } from "../../lib/form_func";
import actionParser from "../actionParser";
import { formatStr } from "../azaleaFormatting";
import configAPI from "../config/configAPI";
import icons from "../icons";
import warpAPI from "../warpAPI";
import { clear, getItemCount } from "./clear";
import uiManager from "../../uiManager";
import versionData from "../../versionData";
import { prismarineDb } from "../../lib/prismarinedb";
import itemdb from "../itemdb";
import {
    NUT_UI_ALT,
    NUT_UI_PAPERDOLL,
    NUT_UI_THEMED,
} from "../../uis/preset_browser/nutUIConsts";
import { themes } from "../../uis/uiBuilder/cherryThemes";
import { getTable } from "../../pdbScriptevents";
import http from "../../networkingLibs/currentNetworkingLib";
import { combatMap } from "../../features/clog";
import OpenClanAPI from "../OpenClanAPI";
import playerStorage from "../playerStorage";
import uiBuilder from "../uiBuilder";
import scripting from "../scripting";
import homes from "../homes";
import emojis from "../emojis";
import { chunk } from "../iconViewer/underscore";
import { worldTags } from "../../worldTags";
import { handleActions } from "../../uis/CustomCommandsV2/handler";

// normalform rewrite??? (coming 20301231)

function replacePlaceholders(obj, i) {
    if (typeof obj === "string") {
        return obj.replace(/<#>/g, i); // ✨ Replace all!
    } else if (Array.isArray(obj)) {
        return obj.map((item) => replacePlaceholders(item, i)); // 🌟 Recurse in arrays!
    } else if (obj && typeof obj === "object") {
        const newObj = {};
        for (const key in obj) {
            newObj[key] = replacePlaceholders(obj[key], i); // 💫 Recurse in objects!
        }
        return newObj;
    } else {//hi
        return obj; // 💤 Leave other types alone~
    }
}
function smartChunkWithPagination({
    items,
    isCountedItem, // item => boolean (whether it counts toward chunk size)
    chunkSize,
    startIndex = 0,
    endIndex = items.length - 1,
    includeOutside = "both", // "before" | "after" | "both" | "none"
}) {
    const chunks = [];

    const before = items.slice(0, startIndex);
    const range = items.slice(startIndex, endIndex + 1);
    const after = items.slice(endIndex + 1);

    let currentChunk = [];
    let count = 0;

    for (const item of range) {
        if (isCountedItem(item)) {
            if (count >= chunkSize) {
                chunks.push(currentChunk);
                currentChunk = [];
                count = 0;
            }
            currentChunk.push(item);
            count++;
        } else {
            currentChunk.push(item);
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    const result = [];

    result.push(...chunks);

    return {
        chunks: result.map((_) => {
            // let res = []
            // if (includeOutside === "after" || includeOutside === "both") {
            //     res.push(...after);
            // }
            // res.push(..._)
            // if (includeOutside === "before" || includeOutside === "both") {
            //     res.push(...before);
            // }
            return _;
        }),
        after,
        before,
    };
}
function isJuneOrEarlyJuly() {
    const now = new Date();
    const m = now.getMonth();
    const d = now.getDate();
    return m === 5 || (m === 6 && d <= 15);
}
class MetaHandler {
    constructor() {
        this.handlers = new Map();
        this.registerDefaultHandlers();
    }

    registerDefaultHandlers() {
        this.registerHandler("#INVITES", this.handleInvites.bind(this));
        this.registerHandler(
            "#CLAN_APPLICATIONS",
            this.clanApplicationsHandler.bind(this)
        );
        this.registerHandler(
            "#ADV_PLAYER_LIST",
            this.handleAdvancedPlayerList.bind(this)
        );
        // this.registerHandler("#", this.handleAdvancedPlayerList.bind(this));
        this.registerHandler("#WARP_GROUP", this.handleWarpGroup.bind(this));
        this.registerHandler("#PLAYER_LIST", this.handlePlayerList.bind(this));
        this.registerHandler(
            "#CLAN_MEMBERS",
            this.handleClanMembers.bind(this)
        );
        this.registerHandler(
            "#PUBLIC_CLANS",
            this.handlePublicClans.bind(this)
        );
        this.registerHandler(
            "#PDB_FIND_ALL:",
            this.handlePdbFindAll.bind(this)
        );
        this.registerHandler("#INTERNAL_REGISTRY:", this.handleInternalRegistry.bind(this))
        this.registerHandler("#HOMES", this.handleHomes.bind(this));
    }
    handleInternalRegistry(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        return uiBuilder.reg1.filter(_=>_.t == 0 && _.cat == meta.substring("#INTERNAL_REGISTRY:".length)).map(_=>{
            return {
                text: _.text,
                icon: icons.resolve(_.texture),
                action() {
                    actionParser.runAction(player, _.cmd)
                }
            }
        })
    }
    handleHomes(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;

        return homes.getAllFromPlayer(player).map((_) => {
            let homeOwner = playerStorage.getPlayerByID(_.data.owner);
            return {
                text: context.parseArgs(
                    formatStr(unprocessedButtonText, player, {
                        home_name: _.data.name,
                        home_name_original: homes.get(_.id)?.data?.name,
                        home_owner: homeOwner.name,
                    }),
                    ...args
                ),
                icon: icons.resolve(
                    context.getIcon(button.iconID, button.iconOverrides, player)
                ),
                action(player) {
                    handleActions(player, button.actions, false, {
                        home_name: _.data.name,
                        home_name_original: homes.get(_.id)?.data?.name,
                        home_owner: homeOwner.name,
                    }, {
                        extraFn: ()=>context.parseArgs(...args)
                    })
                    // for (const action of button.actions) {
                    //     let actionNew = context.parseArgs(
                    //         // formatStr(action, player, ),
                    //         ...args
                    //     );

                    //     actionParser.runAction(player, actionNew);
                    // }
                },
            };
        });
    }

    registerHandler(prefix, handler) {
        this.handlers.set(prefix, handler);
    }

    async handleMeta(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;

        // Check for custom meta handler
        const metaPrefix = meta.split(" ")[0];
        if (scripting.hookExists(`customizer_meta:${metaPrefix}`)) {
            return scripting.callHooks(
                player,
                `customizer_meta:${metaPrefix}`,
                {
                    currView,
                    unprocessedButtonText,
                    buttons: context.buttons,
                    player,
                    data,
                    args,
                    button,
                    meta,
                    playerIsAllowed: context.playerIsAllowed,
                    parseArgs: context.parseArgs,
                    getIcon: context.getIcon,
                }
            );
        }

        // Find and execute registered handler
        for (const [prefix, handler] of this.handlers) {
            if (meta.startsWith(prefix)) {
                return await handler(meta, context);
            }
        }

        return null;
    }

    async handleInvites(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        const data2 = meta.split(" ").slice(1);
        const invite_nsp = data2[0] || "UNKWN";
        const invite_outgoing = data2.length > 1 && data2[1] == "out";

        const invites = this.getInvites(invite_nsp, player, invite_outgoing);
        return this.createInviteButtons(invites, {
            ...context,
            invite_outgoing,
        });
    }

    async handleWarpGroup(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        const warps = uiBuilder.db.findDocuments({ type: 12 }).filter(_=>{
            if(configAPI.getProperty("AFKWarp") && configAPI.getProperty("AFKSystem") && _.data.name == configAPI.getProperty("AFKWarp")) return false;
            return true;
        });
        return warps.map((warp) => ({
            text: context.parseArgs(
                formatStr(unprocessedButtonText, player, {
                    warpname: warp.data.name,
                    warpx: Math.floor(warp.data.loc.x),
                    warpy: Math.floor(warp.data.loc.y),
                    warpz: Math.floor(warp.data.loc.z),
                }),
                ...args
            ),
            icon: warp.data.icon
                ? icons.resolve(warp.data.icon)
                : `textures/azalea_icons/other/location`,
            action: (player) => {
                if (button.disabled) return;
                warpAPI.tpToWarp(player, warp.data.name);
            },
            currView,
        }));
    }

    async clanApplicationsHandler(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        let clan = OpenClanAPI.getClan(player);
        if (!clan) return;
        if (!clan.data.isPublic) return;
        return OpenClanAPI.getApplications(clan.id).map((application) => ({
            text: context.parseArgs(
                formatStr(unprocessedButtonText, player, {
                    from: playerStorage.getPlayerByID(application.playerID)
                        ? playerStorage.getPlayerByID(application.playerID).name
                        : "Unknown Player",
                }),
                ...args
            ),
            icon: null,
            action: (player) => {
                let actionForm = new ActionForm();
                let text = [];
                for (const answer of application.answers) {
                    text.push(
                        `§b${answer[0]} §r§7> §r§f${
                            answer[1] ? answer[1] : "[ No Answer ]"
                        }`
                    );
                }
                actionForm.body(text.join("\n§r"));
                actionForm.divider();
                actionForm.button(
                    `§aAccept\n§7[ Click to Accept ]`,
                    `textures/azalea_icons/accept`,
                    (player) => {
                        OpenClanAPI.acceptApplication(
                            clan.id,
                            application.playerID
                        );
                        player.success("Accepted Application");
                    }
                );
                actionForm.button(
                    `§cDeny\n§7[ Click to Deny ]`,
                    `textures/azalea_icons/deny`,
                    (player) => {
                        OpenClanAPI.denyApplication(
                            clan.id,
                            application.playerID
                        );
                        player.success("Accepted Application");
                    }
                );
                actionForm.show(player, false, () => {});
            },
            currView,
        }));
    }

    handlePublicClans(meta, context) {
        //getPublicClans
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        const clans = OpenClanAPI.getPublicClans();
        return clans.map((clan) => ({
            text: context.parseArgs(
                formatStr(unprocessedButtonText, player, {
                    clan_name: clan.data.name,
                    clan_owner: playerStorage.getPlayerByID(clan.data.owner)
                        ? playerStorage.getPlayerByID(clan.data.owner).name
                        : "Unknown Owner",
                    clan_id: clan.id,
                }),
                ...args
            ),
            icon: clan.data.icon ? icons.resolve(clan.data.icon) : null,
            action: (player) => {
                if (button.disabled) return;
                handleActions(player, button.actions, false, {
                    clan_name: clan.data.name,
                                clan_owner: playerStorage.getPlayerByID(
                                    clan.data.owner
                                )
                                    ? playerStorage.getPlayerByID(
                                          clan.data.owner
                                      ).name
                                    : "Unknown Owner",
                                clan_id: clan.id,
                }, {extraFn: ()=>context.parseArgs(...args)})
                // for (const action of button.actions) {
                //     actionParser.runAction(
                //         player,
                //         context.parseArgs(
                //             formatStr(action, player, {
                //                 clan_name: clan.data.name,
                //                 clan_owner: playerStorage.getPlayerByID(
                //                     clan.data.owner
                //                 )
                //                     ? playerStorage.getPlayerByID(
                //                           clan.data.owner
                //                       ).name
                //                     : "Unknown Owner",
                //                 clan_id: clan.id,
                //             }),
                //             ...args
                //         )
                //     );
                // }
            },
            currView,
        }));
    }

    async handlePlayerList(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        return world
            .getPlayers()
            .filter(
                (player2) =>
                    !button.requiredTag ||
                    context.playerIsAllowed(
                        player,
                        formatStr(
                            button.requiredTag,
                            player2,
                            {},
                            { player2: player }
                        )
                    )
            )
            .map((player2) => ({
                text: context.parseArgs(
                    formatStr(
                        unprocessedButtonText,
                        player2,
                        {},
                        { player2: player }
                    ),
                    ...args
                ),
                icon: icons.resolve(
                    context.getIcon(button.iconID, button.iconOverrides, player)
                ),
                currView,
                action: (player) =>
                    this.handlePlayerListAction(
                        player,
                        player2,
                        button,
                        data,
                        args
                    ),
            }));
    }

    async handleClanMembers(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        let clan = OpenClanAPI.getClanID(player);
        if (!clan) return;
        return OpenClanAPI.getClanMembers(clan)
            .filter((_) => {
                return playerStorage.getPlayerByID(_);
            })
            .map((player2) => {
                return playerStorage.getPlayerByID(player2);
            })
            .map((player2) => ({
                text: context.parseArgs(
                    formatStr(
                        unprocessedButtonText,
                        player2,
                        {},
                        { player2: player, useOfflineMode: true }
                    ),
                    ...args
                ),
                icon: icons.resolve(
                    context.getIcon(button.iconID, button.iconOverrides, player)
                ),
                currView,
                action: (player) =>
                    this.handleClanMemberAction(
                        player,
                        player2,
                        button,
                        data,
                        args
                    ),
            }));
    }

    async handleAdvancedPlayerList(meta, context) {
        let config = {};
        try {
            config = JSON.parse(meta.split(" ").slice(1).join(" "));
        } catch {}
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        return world
            .getPlayers()
            .filter((player2) => {
                if (
                    config.playerFilter &&
                    !context.playerIsAllowed(
                        player,
                        formatStr(config.playerFilter, player2)
                    )
                )
                    return false;
                if (config.excludeSelf && player2.id == player.id) return false;
                return true;
            })
            .filter(
                (player2) =>
                    !button.requiredTag ||
                    context.playerIsAllowed(
                        player,
                        formatStr(
                            button.requiredTag,
                            player2,
                            {},
                            { player2: player }
                        )
                    )
            )
            .map((player2) => ({
                text: context.parseArgs(
                    formatStr(
                        unprocessedButtonText,
                        player2,
                        {},
                        { player2: player }
                    ),
                    ...args
                ),
                icon: icons.resolve(
                    context.getIcon(button.iconID, button.iconOverrides, player)
                ),
                currView,
                action: (player) =>
                    this.handlePlayerListAction(
                        player,
                        player2,
                        button,
                        data,
                        args
                    ),
            }));
    }

    async handlePdbFindAll(meta, context) {
        const { player, button, data, args, currView, unprocessedButtonText } =
            context;
        const [tableName, ...queryParts] = meta
            .substring("#PDB_FIND_ALL:".length)
            .split(",");
        const query = this.parsePdbQuery(queryParts.join(","));
        const table = await getTable(tableName);
        const docs = table
            .findDocuments(query)
            .sort((a, b) => b.updatedAt - a.updatedAt);

        return docs
            .map((doc) => {
                const displayOverride = context.getDisplayOverride(
                    button,
                    player
                );
                const extra = {
                    "pdb_special:id": doc.id.toString(),
                    ...context.convertJSONIntoFormattingExtraVars(doc.data),
                };

                if (
                    button.requiredTag &&
                    !context.playerIsAllowed(
                        player,
                        formatStr(button.requiredTag, player, extra)
                    )
                ) {
                    return null;
                }

                return {
                    text: context.parseArgs(
                        formatStr(unprocessedButtonText, player, extra),
                        ...args
                    ),
                    icon: icons.resolve(
                        displayOverride?.iconID ??
                            context.getIcon(
                                button.iconID,
                                button.iconOverrides || [],
                                player
                            )
                    ),
                    currView,
                    action: (player) =>
                        this.handlePdbAction(player, button, data, args, extra),
                };
            })
            .filter(Boolean);
    }

    // Helper methods
    getInvites(invite_nsp, player, invite_outgoing) {
        const outgoing = [];
        const incoming = [];

        for (const [key, inv] of Object.entries(uiBuilder.invites)) {
            if (inv.invite_name != invite_nsp) continue;
            if (
                !inv.sender ||
                !inv.sender.isValid ||
                !inv.receiver ||
                !inv.receiver.isValid
            )
                continue;
            if (inv.sender.id == player.id) outgoing.push([key, inv]);
            if (inv.receiver.id == player.id) incoming.push([key, inv]);
        }

        return invite_outgoing ? outgoing : incoming;
    }

    createInviteButtons(invites, context) {
        return invites.map(([key, invite]) => ({
            text: context.parseArgs(
                formatStr(
                    context.unprocessedButtonText,
                    invite.receiver,
                    {},
                    { player2: invite.sender }
                ),
                ...context.args
            ),
            icon: icons.resolve(
                context.getIcon(
                    context.button.iconID,
                    context.button.iconOverrides,
                    context.player
                )
            ),
            currView: context.currView,
            action: (player) =>
                this.handleInviteAction(player, key, invite, context),
        }));
    }

    handleInviteAction(player, key, invite, context) {
        if (context.invite_outgoing) {
            delete uiBuilder.invites[key];
            context.open(player, context.data, ...context.args);
        } else {
            this.showInviteResponseForm(player, invite, context);
        }
    }

    showInviteResponseForm(player, invite, context) {
        const form = new ActionForm();
        form.title(`Invite`);
        form.button(
            `§6Back\n§7[ Click to Go Back ]`,
            `textures/azalea_icons/2`,
            (player) => {
                context.open(player, context.data, ...context.args);
            }
        );
        form.button(
            `§aAccept\n§7[ Click to Accept ]`,
            `textures/azalea_icons/accept`,
            (player) => {
                uiBuilder.inviteCMD(
                    {},
                    "accept",
                    invite.invite_name,
                    invite.sender,
                    invite.receiver
                );
                system.runTimeout(() => {
                    context.open(player, context.data, ...context.args);
                }, 1);
            }
        );
        form.button(
            `§cDeny\n§7[ Click to Deny ]`,
            `textures/azalea_icons/deny`,
            (player) => {
                uiBuilder.inviteCMD(
                    {},
                    "deny",
                    invite.invite_name,
                    invite.sender,
                    invite.receiver
                );
                system.runTimeout(() => {
                    context.open(player, context.data, ...context.args);
                }, 1);
            }
        );
        form.show(player, false, () => {});
    }

    handlePlayerListAction(player, player2, button, data, args) {
        if (button.disabled) return;
        handleActions(player, button.actions, false, {}, {player2: player2, swap: true})
        // for (const action of button.actions) {
        //     const action2 = action
        //         .replaceAll("<playername>", player2.name)
        //         .replaceAll("<this>", data.name);

        //     for (let i = 0; i < args.length; i++) {
        //         action2 = action2.replaceAll(`<$${i + 1}>`, args[i]);
        //     }

        //     const result = actionParser.runAction(
        //         player,
        //         formatStr(action2, player2, {}, { player2: player }).replaceAll(
        //             "<playerclicked>",
        //             player.name
        //         )
        //     );
        //     if (!result && button.conditionalActions) break;
        // }
    }

    handleClanMemberAction(player, player2, button, data, args) {
        if (button.disabled) return;
        handleActions(player, button.actions, false, {}, {player2, swap: true, useOfflineMode: true})
        // for (const action of button.actions) {
        //     const action2 = action
        //         .replaceAll("<playername>", player2.name)
        //         .replaceAll("<this>", data.name);

        //     for (let i = 0; i < args.length; i++) {
        //         action2 = action2.replaceAll(`<$${i + 1}>`, args[i]);
        //     }

        //     const result = actionParser.runAction(
        //         player,
        //         formatStr(
        //             action2,
        //             player2,
        //             {},
        //             { player2: player, useOfflineMode: true }
        //         ).replaceAll("<playerclicked>", player.name)
        //     );
        //     if (!result && button.conditionalActions) break;
        // }
    }

    handlePdbAction(player, button, data, args, extra) {
        if (button.disabled) return;
        for (const action of button.actions) {
            let action2 = action.replaceAll("<this>", data.name);
            for (let i = 0; i < args.length; i++) {
                action2 = action2.replaceAll(`<$${i + 1}>`, args[i]);
            }
            const result = actionParser.runAction(
                player,
                formatStr(action2, player, extra)
            );
            if (!result && button.conditionalActions) break;
        }
    }

    parsePdbQuery(queryStr) {
        try {
            return JSON.parse(queryStr);
        } catch {
            return {};
        }
    }
}

class ButtonProcessor {
    constructor() {
        this.metaHandler = new MetaHandler();
    }

    async processButton(button, context) {
        const { player, data, args, currView } = context;
        if (button.type == "separator") return null;
        if (button.type == "pagstart") return null;
        if (button.type == "pagend") return null;
        if (
            !button.meta &&
            button.requiredTag &&
            !context.playerIsAllowed(
                player,
                formatStr(
                    context.parseArgs(button.requiredTag, ...args),
                    player
                ),
                data
            )
        )
            return;

        // Handle special button types
        if (button.type === "header" || button.type === "label") {
            return {
                type: button.type == "label" && button.raw ? "label_raw" : button.type,
                text: button.text,
                currView,
            };
        }

        if (button.type === "divider") {
            return { type: "divider" };
        }

        // Handle button groups
        if (button.type === "group") {
            return this.processButtonGroup(button, context);
        }

        scripting.callHooks(player, `btnDataInterceptor`, {
            player,
            button,
            data,
        });

        // Handle meta buttons
        if (button.meta && !button.sellButtonEnabled) {
            const metaButtons = await this.metaHandler.handleMeta(button.meta, {
                ...context,
                button,
                unprocessedButtonText: this.getUnprocessedButtonText(
                    button,
                    player,
                    data,
                    context
                ),
            });
            if (metaButtons) return metaButtons;
        }

        if (button.type == "poll") {
            let pollData = uiBuilder.altdb.findFirst({
                type: "PLAYER_VOTE_DATA",
                player: playerStorage.getID(player),
                pollID: button.pollID,
            });
            let pollText = [`Poll: ${button.title}`];
            if (button.disabled) {
                pollText[0] = `§c[ENDED] Poll: ${button.title}`;
                for (let i = 0; i < button.options.length; i++) {
                    let option = button.options[i];
                    let votes = uiBuilder.altdb.findDocuments({
                        type: "PLAYER_VOTE_DATA",
                        option: i,
                        pollID: button.pollID,
                    });
                    pollText.push(
                        `§b${option} §7>> §r${votes.length} vote${
                            votes.length != 1 ? "s" : ""
                        }`
                    );
                }
            }
            let btns2 = [
                {
                    type: "label",
                    text: pollText.join("\n§r"),
                    currView,
                },
            ];
            if (!button.disabled) {
                if (pollData) {
                    for (let i = 0; i < button.options.length; i++) {
                        let option = button.options[i];
                        let votes = uiBuilder.altdb.findDocuments({
                            type: "PLAYER_VOTE_DATA",
                            option: i,
                            pollID: button.pollID,
                        });
                        btns2.push({
                            type: "button",
                            text: `§e${option}\n§r§7${votes.length} vote${
                                votes.length != 1 ? "s" : ""
                            }`,
                            action() {
                                player.error(
                                    `You already voted for this poll!`
                                );
                                normalForm.open(player, data, ...args);
                            },
                            currView,
                        });
                    }
                } else {
                    for (let i = 0; i < button.options.length; i++) {
                        let option = button.options[i];
                        btns2.push({
                            type: "button",
                            text: `§b${option}${
                                button.optionSubtext
                                    ? `\n§r§7${button.optionSubtext}`
                                    : ``
                            }`,
                            action() {
                                player.success(`Voted!`);
                                uiBuilder.altdb.insertDocument({
                                    type: "PLAYER_VOTE_DATA",
                                    player: playerStorage.getID(player),
                                    option: i,
                                    pollID: button.pollID,
                                });
                                normalForm.open(player, data, ...args);
                            },
                            currView,
                        });
                    }
                }
            }
            return btns2;
        }

        // Handle regular buttons
        return this.createRegularButton(button, context);
    }

    processButtonGroup(button, context) {
        const { player, data, args, currView } = context;
        const buttons = [];
        const isButtonRow = data.layout === 4 && button.buttonRow;

        button.buttons.forEach((groupButton, index) => {
            if (groupButton.disabled && data.layout != 4) return;

            scripting.callHooks(player, `btnDataInterceptor`, {
                player,
                button: groupButton,
                data,
            });

            const displayOverride = context.getDisplayOverride(
                groupButton,
                player
            );
            const nutUIAltCondition =
                groupButton.nutUIAlt ||
                (groupButton.nutUIColorCondition
                    ? context.playerIsAllowed(
                          player,
                          groupButton.nutUIColorCondition,
                          data
                      )
                    : false);

            let unprocessedButtonText2 = displayOverride
                ? `${displayOverride.text}${
                      displayOverride.subtext
                          ? `\n§r${nutUIAltCondition ? `` : `§7`}${
                                displayOverride.subtext
                            }`
                          : ``
                  }`
                : `${groupButton.text}${
                      groupButton.subtext
                          ? `\n§r${nutUIAltCondition ? `` : `§7`}${
                                groupButton.subtext
                            }`
                          : ``
                  }`;

            // NUT UI formatting for button groups
            let nutUIText = "";
            if (data.layout === 4) {
                const themID = data.theme || 0;
                const themString =
                    themID > 0
                        ? `${NUT_UI_THEMED}${themes[themID]?.[0] || ""}`
                        : ``;
                const nutUIAlt =
                    themID > 0
                        ? `${NUT_UI_ALT}${themes[themID]?.[0] || ""}`
                        : `${NUT_UI_ALT}`;

                // Base NUT UI formatting
                nutUIText = `${groupButton.disabled || (groupButton.requiredTagD && !context.playerIsAllowed(player, groupButton.requiredTagD)) ? "§p§3§0" : ""}${
                    groupButton.nutUIAlt ||
                    (groupButton.nutUIColorCondition
                        ? context.playerIsAllowed(
                              player,
                              groupButton.nutUIColorCondition,
                              data
                          )
                        : false)
                        ? typeof groupButton.altBtnColorOverride === "number" && groupButton.altBtnColorOverride != -1 ? `${NUT_UI_ALT}${themes[groupButton.altBtnColorOverride][0]}` : nutUIAlt
                        : ""
                }`;

                if (button.buttonRow) {
                    // Button Row formatting (max 3 buttons)
                    switch (button.buttons.length) {
                        case 1:
                            nutUIText += "§p§0§0"; // Whole width
                            break;
                        case 2:
                            // Left/Right halves
                            if (index === 0) {
                                nutUIText += "§p§2§2§p§0§0"; // Left half with no vertical size key
                            } else {
                                nutUIText += "§p§1§2"; // Right half
                            }
                            break;
                        case 3:
                            // Thirds
                            if (index === 0) {
                                nutUIText += "§p§2§2§p§2§1§p§0§0"; // Left third with no vertical size key
                            } else if (index === 1) {
                                nutUIText += "§p§2§1§p§1§2§p§0§0"; // Middle third with no vertical size key
                            } else {
                                nutUIText += "§p§1§1§p§1§2"; // Right third
                            }
                            break;
                    }
                } else {
                    // Regular group - vertical stack
                    nutUIText += "§p§0§0"; // Full width for each button
                }

                // Add header button if enabled
                if (groupButton.nutUIHeaderButton) {
                    nutUIText += "§p§4§0";
                }
            }

            const unprocessedButtonText = `${
                data.layout == 4 ? `${nutUIText}§r§f` : ""
            }${unprocessedButtonText2}`;

            if (
                groupButton.requiredTag &&
                !context.playerIsAllowed(
                    player,
                    formatStr(
                        context.parseArgs(groupButton.requiredTag, ...args),
                        player
                    )
                )
            )
                return;

            buttons.push({
                text: context.parseArgs(
                    formatStr(unprocessedButtonText, player),
                    ...args
                ),
                icon: icons.resolve(
                    displayOverride?.iconID ??
                        context.getIcon(
                            groupButton.iconID,
                            groupButton.iconOverrides || [],
                            player
                        )
                ),
                currView,
                action: (player) =>
                    this.handleButtonAction(player, groupButton, data, args),
            });
        });

        return buttons;
    }

    getUnprocessedButtonText(button, player, data, context) {
        const displayOverride = context.getDisplayOverride(button, player);
        const nutUIAltCondition =
            button.nutUIAlt ||
            (button.nutUIColorCondition
                ? context.playerIsAllowed(
                      player,
                      button.nutUIColorCondition,
                      data
                  )
                : false);

        let unprocessedButtonText2 = displayOverride
            ? `${displayOverride.text}${
                  displayOverride.subtext
                      ? `\n§r${nutUIAltCondition ? `` : `§7`}${
                            displayOverride.subtext
                        }`
                      : ``
              }`
            : `${button.text}${
                  button.subtext
                      ? `\n§r${nutUIAltCondition ? `` : `§7`}${button.subtext}`
                      : ``
              }`;

        // NUT UI formatting for regular buttons
        let nutUIText = "";
        if (data.layout === 4) {
            const themID = data.theme || 0;
            const themString =
                themID > 0
                    ? `${NUT_UI_THEMED}${themes[themID]?.[0] || ""}`
                    : ``;
            const nutUIAlt =
                themID > 0
                    ? `${NUT_UI_ALT}${themes[themID]?.[0] || ""}`
                    : `${NUT_UI_ALT}`;

            nutUIText = `${button.disabled || (button.requiredTagD && !context.playerIsAllowed(player, button.requiredTagD)) ? "§p§3§0" : ""}${
                nutUIAltCondition ? typeof button.altBtnColorOverride === "number" && button.altBtnColorOverride != -1 ? `${NUT_UI_ALT}${themes[button.altBtnColorOverride][0]}` : nutUIAlt : ""
            }${
                button.nutUIHalf == 2
                    ? "§p§1§2"
                    : button.nutUIHalf == 1
                    ? "§p§2§2"
                    : button.nutUIHalf == 3
                    ? "§p§2§2§p§2§1"
                    : button.nutUIHalf == 4
                    ? "§p§2§1§p§1§2"
                    : button.nutUIHalf == 5
                    ? "§p§1§1§p§1§2"
                    : ""
            }${button.nutUIHeaderButton ? "§p§4§0" : ""}${
                button.nutUINoSizeKey ? "§p§0§0" : ""
            }`;
        }

        return `${
            data.layout == 4 ? `${nutUIText}§r§f` : ""
        }${unprocessedButtonText2}`;
    }

    createRegularButton(button, context) {
        const { player, data, args, currView } = context;
        const unprocessedButtonText = this.getUnprocessedButtonText(
            button,
            player,
            data,
            context
        );
        const displayOverride = context.getDisplayOverride(button, player);

        return {
            text: context.parseArgs(
                formatStr(unprocessedButtonText, player),
                ...args
            ),
            icon: icons.resolve(
                displayOverride?.iconID ??
                    context.getIcon(
                        button.iconID,
                        button.iconOverrides || [],
                        player
                    )
            ),
            currView,
            action: (player) =>
                this.handleButtonAction(player, button, data, args),
        };
    }

    handleButtonAction(player, button, data, args) {
        if (button.disabled) return;

        let disableBuySellHybrid =
            data.toggles && data.toggles.lt1 ? true : false;
        if (
            button.buyButtonEnabled &&
            button.sellButtonEnabled &&
            !disableBuySellHybrid
        ) {
            let actionForm2 = new ActionForm();
            actionForm2.title("Buy or Sell");
            actionForm2.button(
                `§6Sell\n§7Sell your items`,
                `textures/azalea_icons/other/coins`,
                (player) => {
                    return this.handleSellButton(player, button, data, args);
                }
            );
            actionForm2.button(
                `§aBuy\n§7Buy some items`,
                `textures/azalea_icons/other/coins`,
                (player) => {
                    return this.handleBuyButton(player, button, data, args);
                }
            );
            actionForm2.show(player, false, (player, response) => {
                if (response.canceled) {
                    return normalForm.open(player, data, ...args);
                }
            });
            return;
        }

        if (button.buyButtonEnabled) {
            return this.handleBuyButton(player, button, data, args);
        }

        if (button.sellButtonEnabled) {
            return this.handleSellButton(player, button, data, args);
        }

        if (!button.actions) {
            return actionParser.runAction(player, button.action);
        }

        handleActions(player, button.actions, false)
        // for (const action of button.actions) {
        //     let action2 = action.replaceAll("<this>", data.name);
        //     for (let i = 0; i < args.length; i++) {
        //         action2 = action2.replaceAll(`<$${i + 1}>`, args[i]);
        //     }
        //     const result = actionParser.runAction(
        //         player,
        //         formatStr(action2, player)
        //     );
        //     if (!result && button.conditionalActions) break;
        // }
    }

    handleBuyButton(player, button, data, args) {
        const item = button.buyButtonItem;
        const price = button.buyButtonPrice;
        const scoreboard = button.buyButtonScoreboard || "money";
        const stash = button.buyButtonItem ? parseInt(item.split(":")[0]) : "";
        const slot = button.buyButtonItem ? parseInt(item.split(":")[1]) : "";
        const currency = prismarineDb.economy.getCurrency(scoreboard);

        if (normalForm.getScore(player, scoreboard) >= price) {
            uiManager.open(
                player,
                versionData.uiNames.Basic.Confirmation,
                `Are you sure you want to buy this${
                    currency ? ` for ${currency.symbol} ${price}` : ``
                }?`,
                () =>
                    this.processBuyTransaction(
                        player,
                        button,
                        data,
                        args,
                        scoreboard,
                        stash,
                        slot
                    ),
                () => {
                    normalForm.open(player, data, ...args);
                    player.playSound("random.glass");
                }
            );
        } else {
            player.playSound("random.glass");
            player.error(`You dont have enough to buy this`);
            normalForm.open(player, data, ...args);
        }
    }

    handleSellButton(player, button, data, args) {
        const itemCount = button.sellButtonItemCount;
        const inventory = player.getComponent("inventory");
        const item = button.sellButtonItem.includes(":")
            ? button.sellButtonItem
            : `minecraft:${button.sellButtonItem}`;
        const currItemCount = getItemCount(inventory, item);
        const allowSellingFullInventory =
            data.toggles && data.toggles.t1
                ? true
                : button.allowSellAll
                ? true
                : false;

        if (currItemCount >= itemCount) {
            this.showSellModal(
                player,
                button,
                data,
                args,
                itemCount,
                currItemCount,
                inventory,
                item,
                allowSellingFullInventory
            );
        } else {
            player.playSound("random.glass");
            player.error("You don't have enough items to sell anything");
            normalForm.open(player, data, ...args);
        }
    }

    showSellModal(
        player,
        button,
        data,
        args,
        itemCount,
        currItemCount,
        inventory,
        item,
        sellAll = false
    ) {
        const modal = new ModalForm();
        let max = button.sellButtonItemCount;
        let iter = 1;
        while (
            max < currItemCount &&
            max + itemCount <= currItemCount &&
            iter < 64
        ) {
            max += button.sellButtonItemCount;
            iter++;
        }
        if (sellAll) max = currItemCount;
        modal.slider(
            `Sell Count`,
            button.sellButtonItemCount,
            max,
            button.sellButtonItemCount,
            button.sellButtonItemCount
        );
        modal.submitButton("Sell");
        modal.show(player, false, (player, response) =>
            this.handleSellResponse(
                player,
                response,
                button,
                data,
                args,
                itemCount,
                inventory,
                item,
                max
            )
        );
    }

    handleSellResponse(
        player,
        response,
        button,
        data,
        args,
        itemCount,
        inventory,
        item,
        max
    ) {
        if (response.canceled) return this.open(player, data, ...args);
        if (
            response.formValues[0] % button.sellButtonItemCount !== 0 ||
            response.formValues[0] < button.sellButtonItemCount ||
            response.formValues[0] > max
        ) {
            return this.open(player, data, ...args);
        }

        const amt = response.formValues[0];
        const moneyCount = Math.floor(amt / itemCount) * button.sellButtonPrice;

        try {
            const scoreboard = world.scoreboard.getObjective(
                button.sellButtonScoreboard || "money"
            );
            if (!scoreboard) {
                world.scoreboard.addObjective(
                    button.sellButtonScoreboard || "money"
                );
            }
            try {
                scoreboard.addScore(player, moneyCount);
            } catch {}
            clear(inventory, item, amt);
        } catch(e) {
            world.sendMessage(`${e}`)
        }

        player.playSound("note.pling");
        player.success(
            `Sold x${amt} of ${item
                .split(":")[1]
                .split("_")
                .map((_) => `${_[0].toUpperCase()}${_.substring(1)}`)
                .join(" ")} for $${moneyCount}`
        );
        normalForm.open(player, data, ...args);
    }

    processBuyTransaction(player, button, data, args, scoreboard, stash, slot) {
        try {
            const scoreboard2 = world.scoreboard.getObjective(scoreboard);
            if (!scoreboard2) {
                world.scoreboard.addObjective(scoreboard);
            }
            scoreboard2.addScore(player, -button.buyButtonPrice);

            if (button.buyButtonItem) {
                const item = itemdb.getItem(stash, slot);
                const inventory = player.getComponent("inventory");
                inventory.container.addItem(item);
            } else {
                handleActions(player, button.actions, false)
                // for (const action of button.actions) {
                //     const action2 = action.replaceAll("<this>", data.name);
                //     for (let i = 0; i < args.length; i++) {
                //         action2 = action2.replaceAll(`<$${i + 1}>`, args[i]);
                //     }
                //     const result = actionParser.runAction(
                //         player,
                //         formatStr(action2, player)
                //     );
                //     if (!result && button.conditionalActions) break;
                // }
            }
        } catch (e) {
            // console.warn(e);
        }

        normalForm.open(player, data, ...args);
        player.playSound("note.pling");
    }
}

class NormalFormOpener {
    constructor() {
        this.buttonProcessor = new ButtonProcessor();
    }

    parseArgs(str, ...args) {
        let newStr = str;
        for (let i = 0; i < args.length; i++) {
            newStr = newStr.replaceAll(`<$${i + 1}>`, args[i]);
        }
        return newStr;
    }

    async open(player, data2, ...args) {
        try {
            let data = JSON.parse(JSON.stringify(data2));
            if (
                isJuneOrEarlyJuly() &&
                data.scriptevent &&
                data.scriptevent.startsWith("nutui/") &&
                data.scriptevent != "nutui/warps"
            ) {
                data.name = `${emojis.pride_heart} ${data2.name.replace(
                    /§[a-zA-Z0-9]/g,
                    ""
                )} ${emojis.pride_heart}`;
                // data.theme = 53
            }
            if (data.scriptDeps?.length) {
                const missing = data.scriptDeps.filter(
                    (dep) => !scripting.getActiveScriptIDs().includes(dep)
                );
                if (missing.length) {
                    return player.error(
                        `This UI is missing dependency(s)! §r§f${missing.join(
                            "§r§7, §r§f"
                        )}`
                    );
                }
            }

            if (
                !data.clog_allow &&
                combatMap.has(player.id) &&
                configAPI.getProperty("CLog") &&
                configAPI.getProperty("CLogDisableUIs") &&
                !prismarineDb.permissions.hasPermission(
                    player,
                    "combatlog.bypass"
                )
            ) {
                player.playSound("random.glass");
                player.error("You can't use this UI in combat");
                return;
            }

            if (data.layout == 5) {
                return this.openModalForm(player, data, ...args);
            }

            return this.openActionForm(player, data, ...args);
        } catch (e) {
            player.error(`${e}`);
        }
    }

    async openModalForm(player, data, ...args) {
        const form = new ModalForm();
        const buttons = await this.getButtons(player, data, ...args);

        if (data.name) form.title(data.name);
        if (data.body) form.label(data.body);

        const opts = buttons
            .filter(
                (button) =>
                    !["header", "label", "divider"].includes(button.type)
            )
            .map((button) => ({
                option: button.text,
                callback() {},
            }));

        form.dropdown("Select an option", opts);
        const buttons2 = buttons.filter(
            (button) => !["header", "label", "divider"].includes(button.type)
        );

        form.show(player, false, (player, response) => {
            if (response.canceled) return;
            buttons2[response.formValues[0]].action(player);
        });
    }

    async openActionForm(player, data2, ...args) {
        const form = new ActionForm();
        let data = JSON.parse(JSON.stringify(data2));
        data.buttons = data.buttons.flatMap((btn) => {
            if (btn.type && btn.type != "button") return [btn];

            if (!btn.template || !btn.template.on) return [btn];

            try {
                let { start, end } = btn.template;

                const step = start < end ? 1 : -1;
                let newBtns = [];
                for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
                    let btn2 = JSON.parse(JSON.stringify(btn));
                    newBtns.push(
                        replacePlaceholders({ ...btn2, template: null }, i)
                    );
                }
                return newBtns;
            } catch {
                return [btn];
            }
        });
        const pre = this.getFormPrefix(data);
        const themID = data.theme || 0;
        const themString =
            themID > 0 ? `${NUT_UI_THEMED}${themes[themID]?.[0] || ""}` : ``;
        const nutUIAlt =
            themID > 0
                ? `${NUT_UI_ALT}${themes[themID]?.[0] || ""}`
                : `${NUT_UI_ALT}`;

        form.title(
            `${pre}${formatStr(this.parseArgs(data.name, ...args), player)}`
        );
        if (data.body)
            form.body(formatStr(this.parseArgs(data.body, ...args), player));
        // let items = data.buttons.filter(_=>_.type != "pagstart" && _.type != "pagend")
        let items = data.buttons;
        let endIndex = data.buttons.findIndex((_) => _.type == "pagend");
        if (endIndex == -1) endIndex = items.length - 1;
        let startIndex = Math.max(
            0,
            data.buttons.findIndex((_) => _.type == "pagstart")
        );
        if (startIndex == -1) startIndex = 0;
        // console.warn(`${endIndex > startIndex ? endIndex : items.length - 1}`)
        // world.sendMessage(`Start/End Index: ${startIndex}-${endIndex}`)
        let includeLeft =
            data.buttons.findIndex((_) => _.type == "pagstart") > -1
                ? true
                : false;
        let includeRight =
            data.buttons.findIndex((_) => _.type == "pagend") > -1
                ? true
                : false;
        let pb3 = smartChunkWithPagination({
            items: items,
            chunkSize: data.pagLength ? data.pagLength : 1,
            startIndex: endIndex > startIndex ? startIndex : 0,
            endIndex: Math.max(
                endIndex > startIndex && includeRight
                    ? endIndex
                    : items.length - 1,
                0
            ),
            // includeOutside: includeLeft && includeRight ? "both" : includeLeft ? "before" : includeRight ? "after" : "none",
            isCountedItem: (btn) => btn.type != "separator",
        });
        // pb3.chunks = pb3.chunks
        pb3.after = pb3.after.filter(
            (_) => _.type != "pagstart" && _.type != "pagend"
        );
        pb3.before = pb3.before.filter(
            (_) => _.type != "pagstart" && _.type != "pagend"
        );
        const pb2 = pb3.chunks.filter(
            (_) => _.type != "pagstart" && _.type != "pagend"
        );
        // console.warn(pb2)
        console.warn(JSON.stringify(pb2.map((_) => Array.isArray(_))));
        // if(data.pagpb) data.buttons =
        let newChunk = [];
        let skip = data.buttons.find((_) => _.type == "pagstart")
            ? true
            : false;
        for (const chunk of data.buttons) {
            if (chunk.type == "pagstart") skip = false;
            if (chunk.type == "pagend") skip = true;
            if (skip) continue;
            if (["pagend", "pagstart"].includes(chunk.type)) continue;
            newChunk.push(chunk);
        }
        let ctxargs = [
            player,
            {
                ...data,
                buttons2: data.pagpb
                    ? pb2[data.pagN ? data.pagN : 0]
                    : newChunk,
            },
            ...args,
        ];
        const buttons2 = await this.getButtons(...ctxargs);
        const buttons3 =
            data.pag && data.pagpb
                ? buttons2
                : chunk(buttons2, data.pagLength ? data.pagLength : 1);
        let buttons = data.pag
            ? data.pagpb
                ? buttons3
                : buttons3[
                      Math.min(
                          Math.max(data.pagN ? data.pagN : 0, 0),
                          buttons3.length - 1
                      )
                  ]
            : buttons2;
        if (!buttons) buttons = [];
        let after = [];
        function add(button, fnoverride = null) {
            if (button.type === "header") {
                form.header(`§r§f${formatStr(button.text, player)}`);
                return;
            }
            if (button.type === "label") {
                form.label(`§r§f${formatStr(button.text, player)}`);
                return;
            }
            if (button.type === "label_raw") {
                form.label(`${button.text}`);
                return;
            }
            if (button.type === "divider") {
                form.divider();
                return;
            }
            // console.warn(JSON.stringify(button))
            form.button(
                button.text,
                button.icon,
                fnoverride && typeof fnoverride == "function"
                    ? fnoverride
                    : button.action
            );
        }

        if (data.pag) {
            for (const button of pb3.before && pb3.before.length
                ? pb3.before
                : []) {
                if (button.type == "separator") continue;
                let curr = await this.buttonProcessor.processButton(
                    button,
                    this.getContext2(...ctxargs)
                );
                if (Array.isArray(curr)) {
                    for (const btn of curr) add(btn);
                } else if (curr) {
                    add(curr);
                }
            }
        }
        if (data.pag) {
            let currPag = data.pagN ? data.pagN : 0;
            form.label(
                formatStr(
                    data.pagFormat ? data.pagFormat : "Page <p>/<mp>",
                    player,
                    {
                        p: (currPag + 1).toString(),
                        mp: data.pagpb
                            ? pb2.filter((_) => _.type != "separator").length
                            : buttons3.length,
                    }
                )
            );
            form.divider();
        }

        for (const button of buttons) {
            console.warn(JSON.stringify(button));
            add(button);
        }
        function back(player) {
            let currPag = data.pagN ? data.pagN : 0;

            if (currPag == 0) {
                actionParser.runAction(player, data.pagFBack);
                return;
            }

            data.pagN = currPag - 1;
            this.openActionForm(player, data, ...args);
        }
        function next(player) {
            let currPag = data.pagN ? data.pagN : 0;

            data.pagN = currPag + 1;
            this.openActionForm(player, data, ...args);
        }
        function isBackButton(btn) {
            let currPag = data.pagN ? data.pagN : 0;
            try {
                // if(btn.action && btn.action.replace('/', '') == 'back') return true;
                if (
                    btn.actions &&
                    btn.actions.length &&
                    btn.actions.find(
                        (action) => action.replace("/", "") == "back"
                    )
                )
                    return true;
                return false;
            } catch {
                return false;
            }
        }
        function isNextButton(btn) {
            let currPag = data.pagN ? data.pagN : 0;
            try {
                // if(btn.action && btn.action.replace('/', '') == 'next') return true;
                if (
                    btn.actions &&
                    btn.actions.length &&
                    btn.actions.find(
                        (action) => action.replace("/", "") == "next"
                    )
                )
                    return true;
                return false;
            } catch {
                return false;
            }
        }
        if (data.pag) {
            let currPag = data.pagN ? data.pagN : 0;
            form.divider();
            if (
                currPag <
                (data.pagpb
                    ? pb2.filter((_) => _.type != "separator").length - 1
                    : buttons3.length - 1)
            ) {
                let nextBtn =
                    pb3.after && pb3.after.length
                        ? pb3.after.find((_) => isNextButton(_))
                        : null;
                if (nextBtn) {
                    let parsedBtn = await this.buttonProcessor.processButton(
                        nextBtn,
                        this.getContext2(...ctxargs)
                    );
                    if (parsedBtn && !Array.isArray(parsedBtn)) {
                        add(parsedBtn, (player) => {
                            next.bind(this, player)();
                        });
                    }
                } else {
                    form.button(
                        `${data.pagNext1 ? data.pagNext1 : "§aNext"}${
                            data.pagNext2 ? `\n§r§7${data.pagNext2}` : ``
                        }`,
                        data.pagIcons
                            ? `textures/azalea_icons/other/arrow_blue_right`
                            : null,
                        (player) => {
                            next.bind(this, player)();
                        }
                    );
                }
            }
            if (currPag > 0 || data.pagFBack) {
                let backBtn =
                    pb3.after && pb3.after.length
                        ? pb3.after.find((_) => isBackButton(_))
                        : null;
                if (backBtn) {
                    let parsedBtn = await this.buttonProcessor.processButton(
                        backBtn,
                        this.getContext2(...ctxargs)
                    );
                    if (parsedBtn && !Array.isArray(parsedBtn)) {
                        add(parsedBtn, (player) => {
                            back.bind(this, player)();
                        });
                    }
                } else {
                    form.button(
                        `${data.pagPrev1 ? data.pagPrev1 : "§cBack"}${
                            data.pagPrev2 ? `\n§r§7${data.pagPrev2}` : ``
                        }`,
                        data.pagIcons
                            ? `textures/azalea_icons/other/arrow_blue_left`
                            : null,
                        (player) => {
                            back.bind(this, player)();
                        }
                    );
                }
            }
        }
        // console.warn(`${pb3.after && pb3.after.length ? pb3.after.length : 0}`)
        if (data.pag) {
            for (const button of pb3.after && pb3.after.length
                ? pb3.after
                : []) {
                if (
                    button.type == "separator" ||
                    isBackButton(button) ||
                    isNextButton(button)
                )
                    continue;
                console.warn(button);
                let curr = await this.buttonProcessor.processButton(
                    button,
                    this.getContext2(...ctxargs)
                );
                if (Array.isArray(curr)) {
                    for (const btn of curr) add(btn);
                } else if (curr) {
                    add(curr);
                }
            }
        }
        form.show(player, false, (player, response) => {
            if (response.canceled && data.cancel) {
                actionParser.runAction(player, data.cancel);
            }
        });
    }

    async openActionForm2(player, render_as, data, ...args) {
        console.warn("AAA");
        const form = new ActionForm();
        const pre = this.getFormPrefix(data);
        const themID = data.theme || 0;
        const themString =
            themID > 0 ? `${NUT_UI_THEMED}${themes[themID]?.[0] || ""}` : ``;
        const nutUIAlt =
            themID > 0
                ? `${NUT_UI_ALT}${themes[themID]?.[0] || ""}`
                : `${NUT_UI_ALT}`;

        form.title(
            `${pre}${formatStr(this.parseArgs(data.name, ...args), render_as)}`
        );
        if (data.body)
            form.body(formatStr(this.parseArgs(data.body, ...args), render_as));

        const buttons = await this.getButtons(render_as, data, ...args);
        for (const button of buttons) {
            if (button.type === "header") {
                form.header(formatStr(button.text, render_as));
                continue;
            }
            if (button.type === "label") {
                form.label(formatStr(button.text, render_as));
                continue;
            }
            if (button.type === "divider") {
                form.divider();
                continue;
            }
            form.button(button.text, button.icon, button.action);
        }

        form.show(player, false, (player, response) => {
            if (response.canceled && data.cancel) {
                actionParser.runAction(player, data.cancel);
            }
        });
    }

    getFormPrefix(data) {
        if (data.layout == 1) return `§g§r§i§d§u§i§r`;
        if (data.layout == 2) return `§f§u§l§l§s§c§r§e§e§n§r`;
        if (data.layout == 3) return `§t§e§s§t§r`;
        if (data.layout == 4) {
            const themID = data.theme || 0;
            const themString =
                themID > 0
                    ? `${NUT_UI_THEMED}${themes[themID]?.[0] || ""}`
                    : ``;
            return `§f§0§0${themString}${
                data.layout == 4 && data.paperdoll ? NUT_UI_PAPERDOLL : ``
            }§r`;
        }
        return `§r`;
    }

    async getButtons(player, data, ...args) {
        if (args.length && args[0] == "$$$DBG_VIEW") {
            let btns = [];
            for (const button of data.buttons) {
                if (button.type) continue;
                btns.push({
                    type: "label",
                    text: `§r${
                        button.requiredTag
                            ? button.requiredTag
                            : "No Required condition"
                    }`,
                });
            }
            return btns;
        }
        let data2 = JSON.parse(JSON.stringify(data));
        scripting.callHooks(null, "interceptUIData", data2);

        let buttons = [];
        let currView = -1;
        let canView = true;

        for (const button of data2.buttons2 ? data2.buttons2 : data2.buttons) {
            if (button.type === "separator") {
                canView = this.playerIsAllowed(player, button.condition, data2);
                currView = button.id;
                if (canView) {
                    if (button.clearMode == 1) {
                        buttons = [];
                    } else if (button.clearMode == 2) {
                        buttons = buttons.filter(
                            (_) => !button.clearViewIDs.includes(_.currView)
                        );
                    } else if (button.clearMode == 3) {
                        // world.sendMessage("meow")
                        buttons = buttons.filter((_) => _.currView == -1);
                    }
                }
                continue;
            }
            if (["pagstart", "pagend"].includes(button.type)) continue;
            // buttons.push({
            // type: "label",
            // text: JSON.stringify(button, null, 4)
            // })
            if (!canView) continue;
            if (button.disabled && data2.layout != 4 && button.type != "poll")
                continue;

            const processedButtons = await this.buttonProcessor.processButton(
                button,
                {
                    player,
                    data: data2,
                    args,
                    currView,
                    buttons,
                    playerIsAllowed: this.playerIsAllowed.bind(this),
                    parseArgs: this.parseArgs.bind(this),
                    getIcon: this.getIcon.bind(this),
                    getDisplayOverride: this.getDisplayOverride.bind(this),
                    convertJSONIntoFormattingExtraVars:
                        this.convertJSONIntoFormattingExtraVars.bind(this),
                    open: this.open.bind(this),
                }
            );

            if (Array.isArray(processedButtons)) {
                buttons.push(...processedButtons);
            } else if (processedButtons) {
                buttons.push(processedButtons);
            }
        }

        return buttons;
    }
    getContext2(player, data, ...args) {
        let data2 = JSON.parse(JSON.stringify(data));
        let buttons = [];
        let currView = -1;
        let canView = true;
        return {
            player,
            data: data2,
            args,
            currView: -1,
            buttons,
            playerIsAllowed: this.playerIsAllowed.bind(this),
            parseArgs: this.parseArgs.bind(this),
            getIcon: this.getIcon.bind(this),
            getDisplayOverride: this.getDisplayOverride.bind(this),
            convertJSONIntoFormattingExtraVars:
                this.convertJSONIntoFormattingExtraVars.bind(this),
            open: this.open.bind(this),
        };
    }
    getScore(player, objective) {
        let score = 0;
        if(objective == "vleaf:cc") return prismarineDb.economy.getMoney(player, configAPI.getProperty("clans:clan_price_currency"));
        try {
            const objective2 = world.scoreboard.getObjective(objective);
            score = objective2.getScore(player);
        } catch {
            score = 0;
        }
        if (!score) score = 0;
        return score;
    }

    playerIsAllowedNoNegate(player, tag, ui) {
        if (tag == "$IN_CLAN")
            return OpenClanAPI.getClan(player) ? true : false;
        if (tag == "$CLAN_OWNER") {
            const clan = OpenClanAPI.getClan(player);
            const playerID = playerStorage.getID(player);
            return clan && clan.data.owner == playerID ? true : false;
        }
        if (tag == "$PUBLIC_CLAN") {
            const clan = OpenClanAPI.getClan(player);
            // const playerID = playerStorage.getID(player);
            return clan && clan.data.isPublic;
        }
        if (tag == "$CLAN_HAS_QUESTIONS") {
            const clan = OpenClanAPI.getClan(player);
            // const playerID = playerStorage.getID(player);
            return (
                clan &&
                clan.data.applicationQuestions &&
                clan.data.applicationQuestions.length
            );
        }
        if(tag.startsWith("$REG1_INC/")) {
            return uiBuilder.reg1.find(_=>_.t == 0 && _.cat == tag.substring("$REG1_INC/".length));
        }
        if (tag == "$HAS_CLAN_BASE") {
            try {
                const clan = OpenClanAPI.getClan(player);
                return clan && clan.data.settings.clanBase;
            } catch {
                return false;
            }
        }
        if (tag == "$NETLIB_SETUP") return http.player ? true : false;
        if (tag == "false") return false;
        if (tag == "in_combat") return combatMap.has(player.id);
        if (tag == "true") return true;
        if (tag == "admin") return player.hasTag("admin");
        if (tag.startsWith("$wtag/")) {
            return worldTags.hasTag(tag.substring(6));
        }
        if (tag.startsWith("$entideq/")) {
            return player.id.toString() == tag.substring("$entideq/".length);
        }
        if (tag.startsWith("$thiseq/") && ui) {
            const propertyName = tag.substring("$thiseq/".length);
            return ui.scriptevent == propertyName;
        }
        if (tag.startsWith("$cfg/")) {
            const propertyName = tag.substring(5);
            if (!configAPI.propertiesRegistered[propertyName]) return false;
            if (
                configAPI.propertiesRegistered[propertyName].type !=
                configAPI.Types.Boolean
            )
                return false;
            return configAPI.getProperty(propertyName) == true;
        }
        if (tag == "$server_has_warps") {
            return uiBuilder.db.findDocuments({ type: 12 }).length >= 1;
        }
        if (tag == "$visible_warps") {
            return (
                uiBuilder.db
                    .findDocuments({ type: 12 })
                    .filter((_) =>
                        _.requiredTag && _.requiredTag != "$visible_warps"
                            ? this.playerIsAllowed(player, _.requiredTag)
                            : true
                    ).length >= 1
            );
        }
        if (tag.startsWith("$perm/")) {
            return prismarineDb.permissions.hasPermission(
                player,
                tag.substring(6)
            );
        }

        try {
            if (tag.startsWith(">=")) {
                const [objective, value, fakePlayer] = tag.substring(2).split(" ");
                const compare = value.startsWith("$N/")
                    ? configAPI.getProperty(value.slice(3))
                    : parseInt(value, 10);

                return this.getScore(fakePlayer ? fakePlayer : player, objective) >= compare;
            }

            if (tag.startsWith("<=")) {
                const [objective, value, fakePlayer] = tag.substring(2).split(" ");
                const compare = value.startsWith("$N/")
                    ? configAPI.getProperty(value.slice(3))
                    : parseInt(value, 10);

                return this.getScore(fakePlayer ? fakePlayer : player, objective) <= compare;
            }

            if (tag.startsWith(">")) {
                const [objective, value, fakePlayer] = tag.substring(1).split(" ");
                const compare = value.startsWith("$N/")
                    ? configAPI.getProperty(value.slice(3))
                    : parseInt(value, 10);

                return this.getScore(fakePlayer ? fakePlayer  : player, objective) > compare;
            }

            if (tag.startsWith("<")) {
                const [objective, value, fakePlayer] = tag.substring(1).split(" ");
                const compare = value.startsWith("$N/")
                    ? configAPI.getProperty(value.slice(3))
                    : parseInt(value, 10);

                return this.getScore(fakePlayer ? fakePlayer  : player, objective) < compare;
            }

            if (tag.startsWith("==")) {
                const [objective, value, fakePlayer] = tag.substring(2).split(" ");
                const compare = value.startsWith("$N/")
                    ? configAPI.getProperty(value.slice(3))
                    : parseInt(value, 10);

                return this.getScore(fakePlayer ? fakePlayer : player, objective) === compare;
            }

        } catch(e) {
            return false;
        }

        return player.hasTag(tag);
    }

    playerIsAllowed(player, tagOld, ui) {
        if (tagOld == "") return true;
        if (tagOld.includes(" && ")) {
            let res = true;
            for (const tag of tagOld.split(" && ")) {
                let result = this.playerIsAllowedNoNegate(
                    player,
                    tag.startsWith("!") ? tag.substring(1) : tag,
                    ui
                );
                let resultBool = false;
                if (tag.startsWith("!")) {
                    resultBool = !result;
                } else {
                    resultBool = result;
                }
                if (!resultBool) return false;
            }
            return res;
        }
        for (const tag of tagOld.split(" || ")) {
            let result = this.playerIsAllowedNoNegate(
                player,
                tag.startsWith("!") ? tag.substring(1) : tag,
                ui
            );
            let resultBool = false;
            if (tag.startsWith("!")) {
                resultBool = !result;
            } else {
                resultBool = result;
            }
            if (resultBool) return true;
        }
        return false;
    }

    getIcon(mainIconID, iconOverrides, player) {
        for (const iconOverride of iconOverrides) {
            if (this.playerIsAllowed(player, iconOverride.condition))
                return iconOverride.iconID;
        }
        return mainIconID;
    }

    getDisplayOverride(button, player) {
        if (!button.displayOverrides) return null;

        for (const override of button.displayOverrides) {
            if (this.playerIsAllowed(player, override.condition)) {
                return {
                    text: override.text,
                    subtext: override.subtext,
                    iconID: override.iconID,
                };
            }
        }
        return null;
    }

    convertJSONIntoFormattingExtraVars(json, depths = []) {
        let vars = {};
        for (const key of Object.keys(json)) {
            if (typeof key === "number") {
                vars[
                    `pdb:${depths.join(".")}${depths.length ? "." : ""}${key}`
                ] = json[key].toString();
            } else if (typeof key === "string") {
                vars[
                    `pdb:${depths.join(".")}${depths.length ? "." : ""}${key}`
                ] = json[key];
            } else if (typeof key === "object") {
                vars = {
                    ...vars,
                    ...this.convertJSONIntoFormattingExtraVars(json[key], [
                        ...depths,
                        key,
                    ]),
                };
            } else if (typeof key === "boolean") {
                vars[
                    `pdb:${depths.join(".")}${depths.length ? "." : ""}${key}`
                ] = json[key] ? "true" : "false";
            }
        }
        return vars;
    }
}

const normalForm = new NormalFormOpener();

export default normalForm;
