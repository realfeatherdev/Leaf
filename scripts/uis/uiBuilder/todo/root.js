import playerStorage from "../../../api/playerStorage";
import uiBuilder from "../../../api/uiBuilder";
import { ActionForm } from "../../../lib/form_func";
import uiManager from "../../../uiManager";
import versionData from "../../../versionData";
import { NUT_UI_HEADER_BUTTON, NUT_UI_TAG, NUT_UI_THEMED } from "../../preset_browser/nutUIConsts";
import { themes } from "../cherryThemes";
import moment from'../../../lib/moment'
import './add'
import './edit'
uiBuilder.db.waitLoad().then(()=>{
    if(!uiBuilder.db.findFirst({type: 2048})) {
        uiBuilder.db.insertDocument({
            type: 2048,
            tasks: []
        })
    }
})

uiManager.addUI(versionData.uiNames.UIBuilderTodo.Root, "DOTOROO", (player, completedFilter = false)=>{
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${NUT_UI_THEMED}${themes[68][0]}§rTodo`)
    form.button(`${NUT_UI_HEADER_BUTTON}§r§cBack\n§7Go back to customizer :3`, `textures/azalea_icons/2`, player=>{
        uiManager.open(player, versionData.uiNames.UIBuilderRoot);
    })
    form.button(`${NUT_UI_HEADER_BUTTON}§r§aNew Task\n§7Create a new task`, `textures/azalea_icons/other/add`, player=>{
        uiManager.open(player, versionData.uiNames.UIBuilderTodo.Add)
    })
    let doc = uiBuilder.db.findFirst({type: 2048});
    if(!doc) return;
    let tasks2 = doc.data.tasks.filter(_=>{
        if(!_.private) return true;
        return playerStorage.getID(player) == _.creator;
    }).sort((a,b)=>b.priority - a.priority);
    let tasks = tasks2.filter(_=>_.completed == completedFilter);
    let completedCount = tasks2.filter(_=>_.completed == true).length;
    let uncompletedCount = tasks2.filter(_=>_.completed == false).length;
    form.label(`§f${completedCount} §aCompleted§f, ${uncompletedCount} §nUncompleted`)
    form.button(`${!completedFilter ? `§aShow completed [${completedCount}]` : `§nShow uncompleted [${uncompletedCount}]`}\n§7Change the 'completed' filter`, null, (player)=>{
        uiManager.open(player, versionData.uiNames.UIBuilderTodo.Root, !completedFilter);
    })

    for(let i = 0;i < tasks.length;i++) {
        let taskIndex = doc.data.tasks.findIndex(_=>_.desc == tasks[i].desc && _.completed == tasks[i].completed);
        if(taskIndex < 0) continue;
        let task = tasks[i];
        form.button(`${task.completed ? "§a[DONE] " : "§6"}${task.desc} [${task.priority}]\n§7${playerStorage.getPlayerByID(task.creator).name}, ${moment(task.createdAt).fromNow()}`, null, (player)=>{
            uiManager.open(player, versionData.uiNames.UIBuilderTodo.Edit, taskIndex)
        })
    }
    if(!tasks.length) form.label(`§7§oNothing to see here...`)
    form.show(player, false, ()=>{})
})