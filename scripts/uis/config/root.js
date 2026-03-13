import { ButtonState, InputButton, system, world } from "@minecraft/server";
import configAPI from "../../api/config/configAPI";
import emojis from "../../api/emojis";
import icons from "../../api/icons";
import config from "../../versionData";
import { ActionForm } from "../../lib/form_func";
import { prismarineDb } from "../../lib/prismarinedb";
import http from "../../networkingLibs/currentNetworkingLib";
import uiManager, { Button, UI } from "../../uiManager";
import uiBuilder from "../../api/uiBuilder";
import "./combatLog";
import versionData from "../../versionData";
import { NUT_UI_ALT, NUT_UI_DISABLE_VERTICAL_SIZE_KEY, NUT_UI_HEADER_BUTTON, NUT_UI_LEFT_HALF, NUT_UI_LEFT_THIRD, NUT_UI_MIDDLE_THIRD, NUT_UI_PAPERDOLL, NUT_UI_RIGHT_HALF, NUT_UI_RIGHT_THIRD } from "../preset_browser/nutUIConsts";
import { formatStr } from "../../api/azaleaFormatting";
import actionParser from "../../api/actionParser";
uiBuilder.addInternalUI({
    name: ":cookies: More Settings :cookies:",
    body: "",
    layout: 4,
    type: 0,
    buttons: [
        {
            text: "§cBack",
            subtext: "Go back to Misc Settings",
            action: "scriptevent leafgui:misc_config",
            actions: ["scriptevent leafgui:misc_config"],
            iconID: "^textures/azalea_icons/2",
            iconOverrides: [],
            requiredTag: "",
            displayOverrides: [],
            sellButtonEnabled: false,
            buyButtonEnabled: false,
            nutUIHalf: 0,
            nutUINoSizeKey: false,
            nutUIAlt: false,
            nutUIColorCondition: "",
            nutUIHeaderButton: true,
            id: 6053777794,
        },
        {
            text: "§eProximity Chat",
            subtext: "Configure proximity text chat",
            action: "/scriptevent leafgui:proximity_chat",
            actions: ["/scriptevent leafgui:proximity_chat"],
            iconID: "rpgiab/map_fog",
            iconOverrides: [],
            requiredTag: "",
            disabled: false,
            id: 6053865920,
        },
        {
            text: "§bFlags",
            subtext: "Edit some misc leaf flags",
            action: "/scriptevent leafgui:flags",
            actions: ["/scriptevent leafgui:flags"],
            iconID: "rpgiab/flag_blue",
            iconOverrides: [],
            requiredTag: "",
            disabled: false,
            id: 6053939376,
        },
        {
            text: "§6Join Door",
            subtext: "Filter out players with a code",
            action: "/scriptevent leafgui:player_door",
            actions: ["/scriptevent leafgui:player_door"],
            iconID: "rpgiab/door",
            iconOverrides: [],
            requiredTag: "",
            disabled: false,
            id: 6054032445,
        },
    ],
    subuis: {},
    scriptevent: "nutui/more_settings",
    cancel: "",
    theme: 25,
});
uiManager.addUI(versionData.uiNames.Config.More, "", (player) => {
    player.runCommand("scriptevent leaf:open nutui/more_settings");
});
const CONFIG_ICONS = {
    LEAF_SETTINGS: "Packs/Asteroid/jungle_leaves",
    UI_BUILDER: "Packs/Asteroid/ui",
    CHEST_GUIS: "Packs/Asteroid/chest_tappable",
    SIDEBAR: "Packs/Asteroid/beacon",
    CURRENCY: "Packs/Asteroid/adventure_crystal_uncommon",
    MAIN_SETTINGS: "^textures/azalea_icons/MainSettings",
    ADVANCED: "leaf/image-515",
    MISC_SETTINGS: "^textures/update_pings_icons/config-ui/misc",
    FEATURES: `^textures/update_pings_icons/config-ui/Features`,
    MODERATION: "leaf/image-613",
    DEVELOPER: "^textures/azalea_icons/DevSettings",
    PLATFORM: "^textures/update_pings_icons/config-ui/devices",
    CREDITS: "^textures/update_pings_icons/config-ui/credits",
    DISCORD: "leaf/image-0910",
};

export let targetLeafDBVersion = 11.0;
// system.runInterval(()=>{
//     for(const player of world.getPlayers()) {
//         if(player.inputInfo.getButtonState(InputButton.Jump) == ButtonState.Pressed) {
//             world.sendMessage(`${player.name} is pressing jump`);
//         }
//     }
// },1);
// uiBuilder.internalUIs.push({
//     name: "Config UI / Main ",
//     body: "",
//     layout: 4,
//     type: 0,
//     buttons: [
//         {
//             text: "§cDev Settings",
//             subtext: "uwu kawaii settings please dont touch :trans:",
//             action: "/scriptevent leafgui:dev",
//             actions: ["/scriptevent leafgui:dev"],
//             iconID: "^textures/azalea_icons/DevSettings",
//             iconOverrides: [],
//             requiredTag: "$cfg/DevMode",
//             id: 5,
//             displayOverrides: [],
//             nutUIHeaderButton: true,
//             nutUIHalf: 0,
//             nutUINoSizeKey: false,
//             nutUIAlt: false,
//             sellButtonEnabled: false,
//             sellButtonItem: "minecraft:coal",
//             sellButtonItemCount: 4,
//             sellButtonPrice: 20,
//             sellButtonScoreboard: "money",
//             buyButtonEnabled: false,
//             buyButtonPrice: 20,
//             buyButtonScoreboard: "money",
//             buyButtonItem: "",
//         },
//         {
//             text: "Main Settings",
//             subtext: "",
//             action: "/scriptevent leaf:open nutui",
//             actions: ["/scriptevent leaf:open nutui/main"],
//             iconID: "",
//             iconOverrides: [],
//             requiredTag: "",
//             id: 0,
//             displayOverrides: [],
//             nutUIHeaderButton: false,
//             nutUIHalf: 3,
//             nutUINoSizeKey: true,
//             nutUIAlt: true,
//             sellButtonEnabled: false,
//             sellButtonItem: "minecraft:coal",
//             sellButtonItemCount: 4,
//             sellButtonPrice: 20,
//             sellButtonScoreboard: "money",
//             buyButtonEnabled: false,
//             buyButtonPrice: 20,
//             buyButtonScoreboard: "money",
//             buyButtonItem: "",
//         },
//         {
//             text: "Misc Settings",
//             subtext: "",
//             action: "/scriptevent leaf:open nutui/misc",
//             actions: ["/scriptevent leaf:open nutui/misc"],
//             iconID: "",
//             iconOverrides: [],
//             requiredTag: "",
//             id: 1,
//             displayOverrides: [],
//             nutUIHeaderButton: false,
//             nutUIHalf: 4,
//             nutUINoSizeKey: true,
//             nutUIAlt: false,
//             sellButtonEnabled: false,
//             sellButtonItem: "minecraft:coal",
//             sellButtonItemCount: 4,
//             sellButtonPrice: 20,
//             sellButtonScoreboard: "money",
//             buyButtonEnabled: false,
//             buyButtonPrice: 20,
//             buyButtonScoreboard: "money",
//             buyButtonItem: "",
//         },
//         {
//             text: "Info & Support",
//             subtext: "",
//             action: "/scriptevent leaf:open nutui/credits",
//             actions: ["/scriptevent leaf:open nutui/credits"],
//             iconID: "",
//             iconOverrides: [],
//             requiredTag: "",
//             id: 3,
//             displayOverrides: [],
//             nutUIHeaderButton: false,
//             nutUIHalf: 5,
//             nutUINoSizeKey: false,
//             nutUIAlt: false,
//             disabled: false,
//             sellButtonEnabled: false,
//             sellButtonItem: "minecraft:coal",
//             sellButtonItemCount: 4,
//             sellButtonPrice: 20,
//             sellButtonScoreboard: "money",
//             buyButtonEnabled: false,
//             buyButtonPrice: 20,
//             buyButtonScoreboard: "money",
//             buyButtonItem: "",
//         },
//         {
//             text: "§aFeatures & Experiments",
//             subtext: "Toggle parts of leaf",
//             action: "/scriptevent leafgui:modules_config",
//             actions: ["/scriptevent leafgui:modules_config"],
//             iconID: "Packs/Asteroid/change",
//             iconOverrides: [],
//             requiredTag: "",
//             id: 4,
//             displayOverrides: [],
//             nutUIHeaderButton: false,
//             nutUIHalf: 0,
//             nutUINoSizeKey: false,
//             sellButtonEnabled: false,
//             sellButtonItem: "minecraft:coal",
//             sellButtonItemCount: 4,
//             sellButtonPrice: 20,
//             sellButtonScoreboard: "money",
//             buyButtonEnabled: false,
//             buyButtonPrice: 20,
//             buyButtonScoreboard: "money",
//             buyButtonItem: "",
//             nutUIAlt: false,
//         },
//         {
//             text: "§dGUIs",
//             subtext: "Edit your GUIs",
//             action: "/scriptevent leafgui:ui_builder_main_page",
//             actions: ["/scriptevent leafgui:ui_builder_main_page"],
//             iconID: "Packs/Asteroid/ui",
//             iconOverrides: [],
//             requiredTag: "",
//             id: 2,
//             displayOverrides: [],
//             nutUIHeaderButton: false,
//             nutUIHalf: 1,
//             nutUINoSizeKey: true,
//             sellButtonEnabled: false,
//             sellButtonItem: "minecraft:coal",
//             sellButtonItemCount: 4,
//             sellButtonPrice: 20,
//             sellButtonScoreboard: "money",
//             buyButtonEnabled: false,
//             buyButtonPrice: 20,
//             buyButtonScoreboard: "money",
//             buyButtonItem: "",
//             nutUIAlt: false,
//             meta: "",
//         },
//         {
//             text: "§eGet Help",
//             subtext: "",
//             action: "/scriptevent leaf:open <this>",
//             actions: ["/scriptevent leaf:open <this>"],
//             iconID: "leaf/image-853",
//             iconOverrides: [],
//             requiredTag: "",
//             id: 8,
//             displayOverrides: [],
//             nutUIHeaderButton: false,
//             nutUIHalf: 2,
//             nutUINoSizeKey: false,
//             nutUIAlt: false,
//             disabled: false,
//             sellButtonEnabled: false,
//             sellButtonItem: "minecraft:coal",
//             sellButtonItemCount: 4,
//             sellButtonPrice: 20,
//             sellButtonScoreboard: "money",
//             buyButtonEnabled: false,
//             buyButtonPrice: 20,
//             buyButtonScoreboard: "money",
//             buyButtonItem: "",
//         },
//         {
//             text: "§qSidebar Editor",
//             subtext: "Make Custom Sidebars Easily",
//             action: "scriptevent leafgui:sidebar_editor_root",
//             actions: ["scriptevent leafgui:sidebar_editor_root"],
//             iconID: "leaf/image-521",
//             iconOverrides: [],
//             requiredTag: "",
//             id: 7,
//             displayOverrides: [],
//             nutUIHeaderButton: false,
//             nutUIHalf: 0,
//             nutUINoSizeKey: false,
//             sellButtonEnabled: false,
//             sellButtonItem: "minecraft:coal",
//             sellButtonItemCount: 4,
//             sellButtonPrice: 20,
//             sellButtonScoreboard: "money",
//             buyButtonEnabled: false,
//             buyButtonPrice: 20,
//             buyButtonScoreboard: "money",
//             buyButtonItem: "",
//             nutUIAlt: false,
//         },
//     ],
//     subuis: {},
//     scriptevent: "nutui/main2",
//     lastID: 10,
// });

let tabs = {
    MAIN: 0,
    FEATURES: 1,
    EXTRA: 2,
    MODERATION :3,
    ADVANCED: 4,
    PLUGINS: -1
}
let options = [
    {
        optionsName: "Main Settings",
        options: [
            {
                id: "CUSTOMIZER",
                text: `${formatStr("{{gay \"Customizer\"}}")}\n§7Make UIs, Sidebars, and more!`,
                icon: `textures/items/customizer`,
                callback(player) {
                    uiManager.open(player, versionData.uiNames.UIBuilderRoot)
                },
                condition: "$perm/config.customizer"
            },
            {
                id: "FEATURES",
                text: "§dFeatures & Experiments\n§7Toggle parts of leaf",
                icon: `textures/azalea_icons/other/checkmark`,
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Config.Modules)
                },
                condition: "$perm/config.features&experiments"
            },
            {
                id: "CURRENCIES",
                text: "§6Currencies\n§7Edit this servers currencies",
                icon: "textures/azalea_icons/other/coins",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.CurrencyEditor)
                },
                condition: "$perm/config.economy"
            },

            {
                id: "ZONES",
                text: "§eZones\n§7Configure this server's zones",
                icon: "textures/items/zones",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Zones.Root)
                },
                condition: "$cfg/Zones && $perm/config.zones"
            },
            {
                id: "ROLE_EDITOR",
                text: "§6Role §vEditor\n§7Edit player permissions",
                icon: "textures/azalea_icons/4",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.RoleEditor.Root)
                },
                condition: "$perm/config.roleeditor"
            },
            {
                id: "CHATRANKS",
                text: "§bChat Ranks\n§7Configure this server's chat ranks",
                icon: "textures/azalea_icons/other/tag_blue",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.ChatRanks.Main)
                },
                condition: "$cfg/Chatranks && $perm/config.chatranks.edit"
            },
            {
                id: "THEME",
                get text() {
                    return `§cDefault Theme\n§7Current: ${themes[configAPI.getProperty("LeafTheme")][1]}`
                },
                get icon() {
                    return themes[68][2]
                },
                callback(player) {
                    uiManager.open(player, "edit_cherry_theme", 0, (id)=>{
                        if(id == -2) return uiManager.open(player, versionData.uiNames.CustomizerSettings)
                        configAPI.setProperty("LeafTheme", id)
                        uiManager.open(player, versionData.uiNames.CustomizerSettings)
                    }, configAPI.getProperty("LeafTheme"), false);
                }
            },
            {
                text: `§aLeaf §2Credits\n§7See who helped with Leaf`,
                icon: `textures/minidevs/Otf5shotzz`,
                callback(player) {
                    uiManager.open(player, versionData.uiNames.ConfigCredits)
                }
            }
        ]
    },
    {
        options: [
            {
                id: "BASIC",
                text: "§cBasic Server Info\n§7Edit basic server ifno",
                icon: "textures/azalea_icons/other/tag_blue",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.BasicInfo)
                }
            },
            {
                id: "LANDCLAIMS",
                text: "§5Land Claims\n§7Configure land claims :3",
                icon: "textures/azalea_icons/icontextures/tile2_021",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.LandClaims.Configure)
                },
                condition: "$perm/config.landclaims"
            },
            {
                id: "LEADERBOARDS",
                text: "§6Leaderboards\n§7Configure this servers leaderboards",
                icon: "textures/azalea_icons/13",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Leaderboards.Root)
                },
                condition: "$perm/config.leaderboards"
            },
            {
                id: "CLANS",
                text: "§dClans\n§7Configure clans",
                icon: "textures/azalea_icons/icontextures/tile2_004",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Config.Clans)
                },
                condition: "$perm/config.clans"
            },
            {
                id: "AH",
                text: "§eAuction House\n§7Configure auction house",
                icon: "textures/azalea_icons/ChestIcons/Chest7",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.AuctionHouse.Settings)
                },
                condition: "$perm/config.auctionhouse"
            },
            {
                id: "NAMETAGS_PLUS",
                text: "§cCustom Nametags\n§7Customize player nametags",
                icon: "textures/items/name_tag",
                callback(player) {
                    uiManager.open(player, "nametags_plus_config")
                },
                condition: "$perm/config.nametags"
            },
            {
                id: "RTP",
                text: "§bRandom §eTeleport\n§7Customize RTP",
                icon: "textures/items/ender_pearl",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Config.RTP)
                },
                condition: "$perm/config.rtp"
            },
            {
                id: "SNIPPET_BOOK",
                text: "§aSnippet §bBook\n§7Store & Reuse parts of your UIs",
                icon: "textures/azalea_icons/icontextures/book",
                callback(player) {
                    uiManager.open(player, "snippet_book")
                },
                condition: "$perm/config.snippetbook"
            },
            {
                id: "HOMES",
                text: "§6Homes §3Config\n§7Configure homes",
                icon: "textures/azalea_icons/icontextures/tile2_005",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Homes.Config)
                },
                condition: "$perm/config.homesconfig"
            },
            {
                id: "PVP",
                text: "§bPvP Settings\n§7Configure misc PvP settings",
                icon: "textures/azalea_icons/icontextures/wooden_shield",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.PVP)
                }
            },
            {
                id: "CLOG",
                text: "§bCombat §9Log\n§7Configure combat log",
                icon: "textures/azalea_icons/icontextures/netherite_sword",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.CombatLogConfig)
                },
                condition: "$perm/config.cobatlog"
            },
            {
                id: "WB",
                text: "§dWorld§5Border\n§7Configure the worldborder",
                icon: "textures/azalea_icons/other/grid",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Worldborder)
                },
                condition: "$perm/config.wb"
            },
            {
                id: "AFK",
                text: "§aAFK §2System\n§7Configure the AFK system",
                icon: "textures/azalea_icons/other/blip_orange",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Afk)
                },
                condition: "$perm/config.afk"
            },
            {
                id: "PLAT",
                text: "§ePlatform §cSettings\n§7Platform-based tags",
                icon: "textures/azalea_icons/other/computer",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.PlatformSettings.Root)
                },
                condition: "$perm/config.paltformsettings"
            },
            {
                id: "GIFTS",
                text: "§cGifts\n§7Configure gift codes",
                icon: "textures/azalea_icons/icontextures/gift_01a",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Gifts.Root)
                },
                condition: "$perm/config.gifts"
            },
            {
                id: "REWARDS",
                text: "§eRewards\n§7Configure daily/weekly/monthly rewards",
                icon: "textures/azalea_icons/ChestIcons/Other/slice_5_2",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.DailyRewards.Root)
                },
                condition: "$perm/config.rewards"
            },
            {
                id: "GENS",
                text: "§5Generators\n§7Configure Generators",
                icon: "textures/azalea_icons/ChestIcons/Other/slice_5_2",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Generator.EditRoot)
                },
                condition: "$cfg/Generators && $perm/config.generators"
            }
        ]
    },
    {
        options: [
            {
                id: "CHATFORMAT",
                text: "§cEdit Chat Format\n§7Edit leafs chat format (advanced)",
                icon: "textures/azalea_icons/Chat",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Config.ChatrankFormat)
                }
            },
            {
                id: "CHATFORMATRES",
                text: "§cReset Chat Format\n§7Change leafs format to default",
                icon: "textures/blocks/barrier",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Basic.Confirmation, "Are you sure you want to reset leafs chat format?", ()=>{
                        configAPI.setProperty("chatformat", config.defaults.chatformat);
                        uiManager.open(player, versionData.uiNames.ConfigMain, tab)
                    }, ()=>{
                        uiManager.open(player, versionData.uiNames.ConfigMain, tab)
                    })
                }
            }
        ]
    },
    {
        options: [
            {
                id: "MUTES",
                text: "§eMutes\n§7Stop a player from typing in chat",
                icon: "textures/azalea_icons/5",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.ModerationHub.Mute.Root)
                }
            },
            {
                id: "BANS",
                text: "§cBans\n§7Stop a player from playing the server",
                icon: "textures/azalea_icons/5",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.ModerationHub.Bans.Root)
                }
            },
            {
                id: "REPORTS",
                text: "§6Reports\n§7View player reports",
                icon: "textures/azalea_icons/5",
                callback(player) {
                    uiManager.open(player, versionData.uiNames.Reports.Admin.Dashboard)
                }
            }
        ]
    }
]
uiManager.registerBuilder(config.uiNames.ConfigMain, (player, tab = 0)=>{
    // world.sendMessage(`Opening tab ${tab}`)
    if(!tab) tab = 0
    // world.sendMessage(`${player.name} opened Config UI on tab: ${tab}`)
    let ui = new UI();
    ui.setCherryUI(true)
    ui.setCherryUITheme(68)
    ui.titlePrefix.push(`${NUT_UI_PAPERDOLL}`)
    ui.setTitle("Config UI")
    ui.addButton(
        new Button()
            .setText(`${NUT_UI_LEFT_THIRD}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}${themes[68][0]}${tab == tabs.MAIN ? "§o§1§r§f" : ""}§rMain Settings`)
            .setCallback(()=>{
                uiManager.open(player, config.uiNames.ConfigMain, tabs.MAIN)
            })
    )
    ui.addButton(
        new Button()
            .setText(`${NUT_UI_MIDDLE_THIRD}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}${themes[68][0]}${tab == tabs.FEATURES ? "§o§1§r§f" : ""}§rFeatures`)
            .setCallback(()=>{
                uiManager.open(player, config.uiNames.ConfigMain, tabs.FEATURES)
            })
    )
    ui.addButton(
        new Button()
            .setText(`${NUT_UI_RIGHT_THIRD}${themes[68][0]}${tab == tabs.EXTRA ? "§o§1§r§f" : ""}§rExtra`)
            .setCallback(()=>{
                uiManager.open(player, config.uiNames.ConfigMain, tabs.EXTRA)
            })
    )
    let reg = uiBuilder.reg1.filter(_=>_.cat == "MAIN")
    ui.addButton(
        new Button()
            .setText(`${reg.length ? NUT_UI_RIGHT_HALF + NUT_UI_DISABLE_VERTICAL_SIZE_KEY : ""}${tab == tabs.MODERATION ? "§o§1§r§f" : ""}§rModeration`)
            .setCallback(()=>{
                uiManager.open(player, config.uiNames.ConfigMain, tabs.MODERATION)
            })
    )
    if(reg.length) {
        ui.addButton(
            new Button()
                .setText(`${NUT_UI_LEFT_HALF}${tab == tabs.PLUGINS ? "§o§1§r§f" : ""}§rPlugins`)
                .setCallback(()=>{
                    uiManager.open(player, config.uiNames.ConfigMain, tabs.PLUGINS)
                })
        )
        if(tab == tabs.PLUGINS) {
            ui.addDivider()
            for(const r of reg) {
                let btn = new Button();
                btn.setText(r.text)
                if(r.texture && icons.resolve(r.texture)) btn.setIcon(icons.resolve(r.texture))
                btn.setCallback((p)=>{
                    actionParser.runAction(player, r.cmd)
                })
                ui.addButton(btn)
            }
            return ui;
        }
    }
    // ui.addButton(
    //     new Button()
    //         .setText(`${NUT_UI_LEFT_HALF}${tab == tabs.ADVANCED ? "§o§1§r§f" : ""}§rAdvanced`)
    //         .setCallback(()=>{
    //             uiManager.open(player, config.uiNames.ConfigMain, tabs.ADVANCED)
    //         })
    // )
    if(tab == tabs.PLUGINS) return;
    ui.addDivider()
    try {
        for(const opt of options[tab].options) {
            if(typeof opt == "string") {
                ui.addLabel(opt)
                continue;
            }
            let btn = new Button();
            btn.setText(opt.text)
            btn.setCallback(opt.callback)
            if(opt.condition) btn.setCondition(opt.condition)
            if(opt.icon) {
                btn.setIcon(opt.icon)
                // world.sendMessage(opt.icon)
            }
            ui.addButton(btn)
        }

    } catch(e) {
        ui.addLabel(`${e} ${e.stack}`)
    }
    return ui;
})
uiManager.addUI(config.uiNames.ConfigRoot, "A", (player)=>{
    // world.sendMessage(`AA`)
    uiManager.open(player, config.uiNames.ConfigMain, tabs.MAIN)
})
uiManager.addUI(config.uiNames.Config.Misc, "A", (player)=>{
    uiManager.open(player, config.uiNames.ConfigMain, tabs.FEATURES)
})

// uiManager.addUI(config.uiNames.ConfigRoot, "Config Root", (player) => {
//     // return player.runCommand("scriptevent leaf:open nutui/main");
//     let actionForm = new ActionForm();
//     let body = [];
//     actionForm.button(
//         "New design",
//         "textures/azalea_icons/DevSettings",
//         (player) => {
//             player.removeTag("old-config");
//             uiManager.open(player, config.uiNames.ConfigMain);
//         }
//     );
//     if (
//         prismarineDb.version > targetLeafDBVersion ||
//         prismarineDb.version < targetLeafDBVersion
//     )
//         body.push(
//             prismarineDb.version > targetLeafDBVersion
//                 ? `I see u are time travelling :3`
//                 : prismarineDb.version < targetLeafDBVersion
//                 ? `You are 100%% going to break something in here bro`
//                 : `idk`
//         );
//     if (http.player) {
//         body.push(
//             `§bExternal Network is setup properly. You can now get more features from Leaf Essentials`
//         );
//     }
//     if (body && body.length) {
//         actionForm.body(body.join("\n§r"));
//     }

//     actionForm.title(`§r${emojis.book36} §6Config UI ${emojis.book36}`);
//     // actionForm.button(`§2Leaf Settings\n§r§7Common settings`, icons.resolve(CONFIG_ICONS.LEAF_SETTINGS), (player)=>{
//     //     player.sendMessage(`§cThis feature is coming soon`);
//     //     uiManager.open(player, config.uiNames.ConfigRoot)
//     // })
//     // actionForm.button(`§cUI Builder\n§r§7Make UIs easily!`, icons.resolve(CONFIG_ICONS.UI_BUILDER), (player)=>{
//     //     uiManager.open(player, config.uiNames.UIBuilderRoot)
//     // })
//     // actionForm.button(`§6Chest GUIs\n§r§7Make Chest UIs easily!`, icons.resolve(CONFIG_ICONS.CHEST_GUIS), (player)=>{
//     //     uiManager.open(player, config.uiNames.ChestGuiRoot)
//     // })
//     // actionForm.button(`§bSidebar\n§r§7Make sidebars easily!`, icons.resolve(CONFIG_ICONS.SIDEBAR), (player)=>{
//     //     uiManager.open(player, config.uiNames.SidebarEditorRoot)
//     // })
//     // actionForm.button(`§nCurrency Editor\n§r§7idfk`, icons.resolve(CONFIG_ICONS.CURRENCY), (player)=>{
//     //     uiManager.open(player, config.uiNames.CurrencyEditor)
//     // })
//     // actionForm.header("§e§lWARNING")
//     // actionForm.label("This is a development version of leaf, and made for a major Minecraft scripting api update. Please report any and all bugs.")
//     // actionForm.label("NOTE: If you are going to use this on a real server, §cPLEASE §fmake a backup. This version has erased all config on my testing world before.")
//     // actionForm.button(`§l§aLeaf Essentials\n§r§7Version 3.0`, `textures/azalea_icons/Azalea`, (player)=>{
//     // uiManager.open(player, config.uiNames.ConfigRoot)
//     // })
//     // actionForm.label("§7-------------------------------")

//     actionForm.button(
//         `§l§nMain Settings\n§r§7Configure most features here`,
//         icons.resolve(CONFIG_ICONS.MAIN_SETTINGS),
//         (player) => {
//             uiManager.open(player, config.uiNames.ConfigMain);
//         }
//     );
//     // actionForm.button(`§l§dAdvanced Settings\n§r§7Very advanced fr fr`, icons.resolve(CONFIG_ICONS.ADVANCED), (player)=>{
//     //     uiManager.open(player, config.uiNames.ConfigMain)
//     // })
//     actionForm.button(
//         `§l§bMisc Settings\n§r§7Chat rank formats & more!`,
//         icons.resolve(CONFIG_ICONS.MISC_SETTINGS),
//         (player) => {
//             uiManager.open(player, config.uiNames.Config.Misc);
//         }
//     );
//     actionForm.button(
//         `§l§aFeatures/Experiments\n§r§7Manage leaf features`,
//         icons.resolve(CONFIG_ICONS.FEATURES),
//         (player) => {
//             uiManager.open(player, config.uiNames.Config.Modules);
//         }
//     );
//     // actionForm.button(`§l§dModeration Settings\n§r§7Change moderation settings`, icons.resolve(CONFIG_ICONS.MODERATION))
//     actionForm.button(
//         `§l§nPlatform Settings\n§r§7[ Click to view info ]`,
//         icons.resolve(CONFIG_ICONS.PLATFORM),
//         (player) => {
//             uiManager.open(player, config.uiNames.PlatformSettings.Root);
//         }
//     );
//     // actionForm.label("§7-------------------------------")
//     actionForm.divider();
//     actionForm.button(
//         `§l§eCredits\n§r§7See who helped with leaf`,
//         icons.resolve(CONFIG_ICONS.CREDITS),
//         (player) => {
//             uiManager.open(player, config.uiNames.ConfigCredits);
//         }
//     );
//     if (configAPI.getProperty("DevMode")) {
//         // actionForm.label("§7-------------------------------")
//         actionForm.label("§v------- Developer Settings -------");
//         actionForm.button(
//             `§l§eDeveloper Settings\n§r§7MAY CAUSE BUGS.`,
//             icons.resolve(CONFIG_ICONS.DEVELOPER)
//         );
//     }

//     if (http.player) {
//         actionForm.label("§7-------------------------------");
//         actionForm.button(
//             `§l§9Discord Logs\n§r§7Online Exclusive`,
//             icons.resolve(CONFIG_ICONS.DISCORD),
//             (player) => {}
//         );
//     }
//     actionForm.show(player, false, () => {});
// });
