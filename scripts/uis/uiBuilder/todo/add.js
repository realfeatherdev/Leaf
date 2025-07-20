import playerStorage from "../../../api/playerStorage";
import uiBuilder from "../../../api/uiBuilder";
import { ModalForm } from "../../../lib/form_func";
import uiManager from "../../../uiManager";
import versionData from "../../../versionData";

function afswowwwwwwwwwwwwwwwwwwaswOwO(numby) {
    return Math.max(isNaN(parseInt(numby)) ? 0 : parseInt(numby), 0);
}

uiManager.addUI(versionData.uiNames.UIBuilderTodo.Add, "TO=PFOEEoDOROOTTTTTTTTTTTTTTTTTTT AAAAAAAAAAAAAAAAAAAAAAAAA", (player, taskIndex = -1)=>{
    let doc = uiBuilder.db.findFirst({type: 2048})
    if(!doc) return;
    let task = taskIndex > -1 ? doc.data.tasks[taskIndex] : null;
    // hehe i olove bnalsll
    // BALSSSSSSSSSSSSSS
    // BALLLLLLLLLLLSSSSSSSSSSSSSSSSSS
    // BALLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLSSSSSSSSSS
    // PP BALLS
    // /particle ppballs:ppballs ~~~
    // pp
    // ~~
    // ligatures
    // leg
    // leg
    // cut my legs open
    // for a prize
    // steal my femur
    // use it as a medieval weapon
    // eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
    // 90gfev3r ug8943ug9838
    // pp
    // im high
    let modalform = new ModalForm();
    modalform.title(`${taskIndex == -1 ? "New" : "Edit"} Task`)
    modalform.textField("Task Description", "Type a description for the task", task ? task.desc ? task.desc : "" : "")
    modalform.textField("Priority", "Type a priority for this task", task && typeof task.priority === "number" ? `${task.priority}` : "", ()=>{}, "A priority. :3")
    if(taskIndex == -1) {
        modalform.toggle("Only me", false, ()=>{}, "If enabled, only you can view and edit this task.")
    }
    modalform.show(player, false, (player, response)=>{
        if(response.canceled) return uiManager.open(player, versionData.uiNames.UIBuilderTodo.Root)
        if(taskIndex == -1) {
            doc.data.tasks.push({
                creator: playerStorage.getID(player),
                completed: false,
                private: response.formValues[2],
                desc: response.formValues[0],
                priority: afswowwwwwwwwwwwwwwwwwwaswOwO(response.formValues[1]),
                createdAt: Date.now()
            })
            uiBuilder.db.overwriteDataByID(doc.id, doc.data)
        } else {
            doc.data.tasks[taskIndex].desc = response.formValues[0]
            doc.data.tasks[taskIndex].priority = afswowwwwwwwwwwwwwwwwwwaswOwO(response.formValues[1])
            uiBuilder.db.overwriteDataByID(doc.id, doc.data)
        }
        return uiManager.open(player, versionData.uiNames.UIBuilderTodo.Root)
    })
})