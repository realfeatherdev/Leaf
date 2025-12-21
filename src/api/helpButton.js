import { ActionForm } from "../lib/form_func";
import { NUT_UI_HEADER_BUTTON } from "../uis/preset_browser/nutUIConsts";

export function helpBaloon(ui, infobox, backFn = ()=>{}) {
    ui.button(`${NUT_UI_HEADER_BUTTON}§r§bGet Help\n§7Get an explanation for this!`, `textures/ui/infobulb`, (player)=>{
        let form = new ActionForm();
        form.title("§bInfo");
        form.button(`§cBack\n§7Go back to main dialog`, `textures/azalea_icons/2`, (player)=>{
            backFn(player)
        })
        form.label(Array.isArray(infobox) ? infobox.join('\n§r§f') : infobox);
        form.show(player, false, (player, response)=>{})
    })
}