import { world } from "@minecraft/server";
import uiBuilder from "../../api/uiBuilder";
import zones from "../../api/zones";
import { ModalForm } from "../../lib/form_func";
import uiManager from "../../uiManager";
import versionData from "../../versionData";

function parseCoords(str) {
    let parts = str.split(" ").map(p => parseInt(p.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) return [0, 0, 0];
    return parts;
}

uiManager.addUI(
    versionData.uiNames.Zones.Add,
    "Add Zone",
    (player, id = -1) => {
        let form = new ModalForm();
        let name = "";
        let priority = 1;
        let start = [0, 0, 0];
        let end = [0, 0, 0];
        let doc;
        
        if (id > -1) {
            doc = uiBuilder.db.getByID(id);
            name = doc.data.name;
            priority = doc.data.priority;
            start = [doc.data.x1, doc.data.y1, doc.data.z1];
            end = [doc.data.x2, doc.data.y2, doc.data.z2];
        }
        form.title(id > -1 ? "Edit Zone": "Create Zone")
        form.textField("Name", "Type a name", name);
        form.slider("Priority", 1, 64, 1, priority);
        form.textField("Start Coordinates", "x,y,z", start.join(" "));
        form.textField("End Coordinates", "x,y,z", end.join(" "));
        let dimensions = [
            ["Overworld", "overworld"],
            ["The Nether", "nether"],
            ["The End", "the_end"]
        ]
        form.dropdown("Dimension", dimensions.map(_=>{
            return {
                option: _[0],
                callback() {}
            };
        }), Math.max(id < 0 ? 0 : dimensions.findIndex(_=>_[1] == doc.data.dimension), 0))
        form.show(player, false, (player, response) => {
            const startCoords = parseCoords(response.formValues[2]);
            const endCoords = parseCoords(response.formValues[3]);

            if (id > -1) {
                priority = response.formValues[1];
                if (
                    uiBuilder.db.findFirst({ type: 14, name: response.formValues[0] }) &&
                    response.formValues[0] != name
                )
                    return;

                name = response.formValues[0];
                doc.data.name = name;
                doc.data.priority = priority;
                [doc.data.x1, doc.data.y1, doc.data.z1] = startCoords;
                [doc.data.x2, doc.data.y2, doc.data.z2] = endCoords;
                doc.data.dimension = dimensions[response.formValues[4]][1] 
                uiBuilder.db.overwriteDataByID(doc.id, doc.data);
                uiManager.open(player, versionData.uiNames.Zones.Edit, id);
            } else {
                try {
                zones.addZone(
                    response.formValues[0],
                    startCoords[0],
                    startCoords[1],
                    startCoords[2],
                    endCoords[0],
                    endCoords[1],
                    endCoords[2],
                    response.formValues[1],
                    [],
                    world.getDimension(dimensions[response.formValues[4]][1])
                );
                uiManager.open(player, versionData.uiNames.UIBuilderRoot);

                } catch(e) {
                    player.error(`${e} ${e.stack}`)
                }
            }
        });
    }
);
