import uiBuilder from "../../api/uiBuilder";
import { ModalForm } from "../../lib/form_func";
import uiManager, { Button, UI } from "../../uiManager";
import versionData from "../../versionData";
import config from "../../versionData";
import { NUT_UI_DISABLE_VERTICAL_SIZE_KEY, NUT_UI_DISBALE_BTN, NUT_UI_HEADER_BUTTON, NUT_UI_LEFT_HALF, NUT_UI_MODAL, NUT_UI_RIGHT_HALF } from "../preset_browser/nutUIConsts";
import './channels';

uiManager.registerBuilder(config.uiNames.UIBuilderAddSubmenu, () => {
    return new UI()
        .setCherryUI(true)
        .setCherryUITheme(68)
        .setTitle(`New creation`)
        .addButton(
            new Button()
                .setText(
                    `${NUT_UI_HEADER_BUTTON}§r§c§lBack\n§r§7Go back to the main UI view`
                )
                .setIcon(`textures/azalea_icons/2`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.UIBuilderRoot);
                })
        )
        .addLabel("Organization:")
        .addButton(
            new Button()
                .setText(`§5Folder\n§7Organize your UIs in a folder`)
                .setIcon(`textures/azalea_icons/other/folder`)
                .setCallback((player) => {
                    let modalForm = new ModalForm();
                    modalForm.title(`${NUT_UI_MODAL}Create Folder`);
                    modalForm.textField("Name", "Name");
                    modalForm.show(player, false, (player, response) => {
                        if (response.canceled)
                            return uiManager.open(
                                player,
                                config.uiNames.UIBuilderRoot
                            );
                        uiBuilder.createFolder(response.formValues[0]);
                        return uiManager.open(
                            player,
                            config.uiNames.UIBuilderRoot
                        );
                    });
                })
        )
        .addButton(
            new Button()
                .setIcon("textures/azalea_icons/other/package")
                .setText("§vBox\n§7Organize your UIs in a chest")
                .setCallback((player) => {
                    let modalForm = new ModalForm();
                    modalForm.title(`${NUT_UI_MODAL}Create Box`);
                    modalForm.textField("Name", "Name");
                    modalForm.show(player, false, (player, response) => {
                        if (response.canceled)
                            return uiManager.open(
                                player,
                                config.uiNames.UIBuilderRoot
                            );
                        uiBuilder.createBox(response.formValues[0]);
                        return uiManager.open(
                            player,
                            config.uiNames.UIBuilderRoot
                        );
                    });
                })
        )
        // .addButton(
        //     new Button()
        //         .setIcon("textures/coxes")
        //         .setText("§3Carrot\n§7decherrifyied floder")
        //         .setCallback((player) => {
        //             let modalForm = new ModalForm();
        //             modalForm.title(`${NUT_UI_MODAL}Create Box`);
        //             modalForm.textField("Name", "Name");
        //             modalForm.show(player, false, (player, response) => {
        //                 if (response.canceled)
        //                     return uiManager.open(
        //                         player,
        //                         config.uiNames.UIBuilderRoot
        //                     );
        //                 uiBuilder.createCox(response.formValues[0]);
        //                 return uiManager.open(
        //                     player,
        //                     config.uiNames.UIBuilderRoot
        //                 );
        //             });
        //         })
        // )

        .addLabel("UIs")
        .addButton(
            new Button()
                .setText(
                    `§aAction Form\n§7Main UI type, recommended for buttons`
                )
                .setIcon(`textures/azalea_icons/other/node`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.UIBuilderAdd);
                })
        )
        .addButton(
            new Button()
                .setText(`§eModal Form\n§7Include text fields, toggles, and more!`)
                .setIcon(`textures/azalea_icons/other/keyboard`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.Modal.Add);
                })
        )
        .addButton(
            new Button()
                .setText(
                    `${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§r§eChest UI\n§7Chest UI type`
                )
                .setIcon(`textures/azalea_icons/other/inventory`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.ChestGuiAdd);
                })
        )
        .addButton(
            new Button()
                .setText(
                    `${NUT_UI_LEFT_HALF}§r§6Adv. Chest UI\n§7Advanced Chest UI`
                )
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.ChestGuiAddAdvanced);
                })
        )
        .addButton(
            new Button()
                .setText(`§eSidebar\n§7Create high quality sidebars`)
                .setIcon(`textures/azalea_icons/other/text`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.SidebarEditorAdd);
                })
        )
        .addButton(
            new Button()
                .setText(`§dToast\n§7Create a customizable notification`)
                .setIcon(`textures/azalea_icons/other/information`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.ToastBuilderAdd);
                })
        )
        .addButton(
            new Button()
                .setText(`${NUT_UI_DISBALE_BTN}§r§cMessage Form\n§72 button form with text`)
                .setIcon(`textures/azalea_icons/other/window_dialogue`)
        )
        .addLabel("Utility:")
        .addButton(
            new Button()
                .setText(`§cFunction\n§7Funfction :3`)
                .setIcon(`textures/azalea_icons/other/function`)
                .setCallback((player)=>{
                    let modal = new ModalForm();
                    modal.textField("UniqueID", "Unique ID of this function");
                    modal.show(player, false, (player, response) => {
                        if (response.canceled) return;
                        uiBuilder.createFunction(response.formValues[0]);
                        uiManager.open(player, config.uiNames.UIBuilderRoot);
                    });

                })
        )
        .addButton(
            new Button()
                .setText(`§bInvite\n§7Use leafs invite manager!`)
                .setIcon(`textures/azalea_icons/send_req`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.InviteManager.Add);
                })
        )
        .addButton(
            new Button()
                .setText(`§uEvent\n§7Make a new V2 Event`)
                .setIcon(`textures/azalea_icons/other/clock`)
                .setCallback((player) => {
                    uiManager.open(
                        player,
                        config.uiNames.EventsV2.AddStepSelector
                    );
                })
        )
        .addButton(
            new Button()
                .setText(
                    `§eScript\n§7Edit functionality of your world with javascript`
                )
                .setIcon(`textures/azalea_icons/other/script_code`)
                .setCallback((player) => {
                    let modal = new ModalForm();
                    modal.textField("UniqueID", "Unique ID of this script");
                    modal.show(player, false, (player, response) => {
                        if (response.canceled) return;
                        uiBuilder.createScript(response.formValues[0]);
                        uiManager.open(player, config.uiNames.UIBuilderRoot);
                    });
                })
        )
        .addButton(
            new Button()
                .setText(`${NUT_UI_DISBALE_BTN}§eUser-Generated Content Storage\n§7Delayed :<`)
                .setIcon(`textures/azalea_icons/other/clipboard`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.PlayerContentManager.Add);
                })
        )

        .addButton(
            new Button()
                .setText(`${NUT_UI_DISBALE_BTN}§r§6Timer\n§7Run stuff on an interval`)
                .setIcon(`textures/azalea_icons/other/hourglass`)
        )
        .addButton(
            new Button()
                .setText(
                    `${NUT_UI_DISBALE_BTN}§r§vConditional Redirector\n§7Conditionally open different UIs`
                )
                .setIcon(`textures/azalea_icons/other/arrow_branch`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.ToastBuilderAdd);
                })
        )
        .addLabel("Server setup:")
        .addButton(
            new Button()
                .setText(`§aWarp\n§7Set a location players can teleport to`)
                .setIcon(`textures/azalea_icons/other/location`)
                .setCallback((player) => {
                    uiManager.open(
                        player,
                        versionData.uiNames.Warps.Wizard.Root
                    );
                })
        )
        .addButton(
            new Button()
                .setText(`§6Zone\n§7Set an area with special permissions`)
                .setIcon(`textures/items/zones`)
                .setCallback((player) => {
                    uiManager.open(
                        player,
                        versionData.uiNames.Zones.Add
                    );
                })
        )
        .addButton(
            new Button()
                .setText("§cMine\n§7Create a prison-like mine")
                .setIcon("textures/azalea_icons/icontextures/tile2_024")
                .setCallback((player)=>{
                    uiManager.open(player, versionData.uiNames.MinesAdd)
                })
        )
        .addButton(
            new Button()
                .setText(`${NUT_UI_DISBALE_BTN}§r§qIsland\n§7Delayed!`)
                .setIcon(`textures/azalea_icons/other/terrain`)
                .setCallback((player)=>{
                    return;
                    // return;
                    let modalForm = new ModalForm();
                    modalForm.title("Create an Island")
                    modalForm.label("§bUnique ID §fis the unique id of the island you use to integrate this into custom UIs. §cThis island wont work until you fully configure it. §aCheck §ehttps://leaf.trashdev.org §afor guideds")
                    modalForm.textField("Unique ID", "Read the text above :3", "")
                    modalForm.show(player, false, (player, response)=>{
                        if(response.canceled || !response.formValues[1]) return uiManager.open(player, config.uiNames.UIBuilderAddSubmenu);
                        uiBuilder.createIsland(response.formValues[1])
                        uiManager.open(player, config.uiNames.UIBuilderRoot)
                    })
                })
        )
        .addButton(
            new Button()
                .setText(`${NUT_UI_DISBALE_BTN}§r§fItem Definition\n§7Advanced binds!`)
                .setIcon(`textures/azalea_icons/other/sword_link`)
        )
        .addLabel("Chat:")
        .addButton(
            new Button()
                .setText(`${NUT_UI_DISBALE_BTN}§r§eChat Widget\n§7Customize chat :3`)
                .setIcon(`textures/azalea_icons/other/widget`)
        )
        .addButton(
            new Button()
                .setText(`§r§6Channel\n§7I overcomplicated this one`)
                .setIcon(`textures/azalea_icons/other/key_c`)
                .setCallback((player)=>{
                    uiManager.open(player, versionData.uiNames.Channels.Add)
                })
        )
        .addButton(
            new Button()
                .setText(`§r§bCommand\n§7Create chat commands`)
                .setIcon(`textures/azalea_icons/other/console`)
                .setCallback((player) => {
                    uiManager.open(
                        player,
                        config.uiNames.CustomCommandsV2.create
                    );
                })
        )
        .addLabel("Legacy:")
        .addButton(
            new Button()
                .setText(`§bModal Form (Legacy)\n§7Advanced UI type`)
                .setIcon(`textures/azalea_icons/other/keyboard`)
                .setCallback((player) => {
                    uiManager.open(player, config.uiNames.Modal.Add);
                })
        );
});