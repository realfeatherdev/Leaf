import uiBuilder from "../../../api/uiBuilder";
import { ActionForm } from "../../../lib/form_func";
import uiManager from "../../../uiManager";
import versionData from "../../../versionData";
import { NUT_UI_HEADER_BUTTON, NUT_UI_TAG, NUT_UI_THEMED } from "../../preset_browser/nutUIConsts";
import { themes } from "../cherryThemes";

uiManager.addUI(versionData.uiNames.UIBuilderTodo.Edit, "AIRTHYUI*RE##w", (player, taskIndex)=>{
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[25][0]}§rTodo`)
    form.button(`${NUT_UI_HEADER_BUTTON}§r§cBack\n§7Go back to customizer :3`, `textures/azalea_icons/2`, player=>{
        uiManager.open(player, versionData.uiNames.UIBuilderTodo.Root);
    })
    form.button(`§bEdit Task\n§7Edit basic properties of this task`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.UIBuilderTodo.Add, taskIndex);
    })
    let doc = uiBuilder.db.findFirst({type: 2048});
    if(!doc) return;
    let task = doc.data.tasks[taskIndex];
    form.button(`${task.completed ? "§nMark as uncompleted" : "§aMark as completed"}\n§7Edit basic properties of this task`, null, (player)=>{
        doc.data.tasks[taskIndex].completed = !task.completed;
        uiBuilder.db.overwriteDataByID(doc.id, doc.data);
        uiManager.open(player, versionData.uiNames.UIBuilderTodo.Edit, taskIndex)
    })
    form.button(`§cDelete task\n§7Fully delete this task from leafs database`, null, (player)=>{
        doc.data.tasks.splice(taskIndex, 1)
        uiBuilder.db.overwriteDataByID(doc.id, doc.data);
        uiManager.open(player, versionData.uiNames.UIBuilderTodo.Root)
    })

    form.show(player, false, (player, response)=>{})
})