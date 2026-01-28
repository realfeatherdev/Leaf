import { world } from '@minecraft/server';

export class ScoreboardPersistentStorage {
    constructor() {
        this.name = "SCOREBOARD_PERSISTENT";
        this.trashable = true;

    }
    load(table) {
        let scoreboard = world.scoreboard.getObjective("PDB");
        if(!scoreboard) scoreboard = world.scoreboard.addObjective("PDB", "PrismarineDB");
        let val = null;
        for(const participant of scoreboard.getParticipants()) {
            if(participant.displayName.startsWith(`@prismarine[${table}](`)) {
                val = JSON.parse(participant.displayName.substring(`@prismarine[${table}](`.length).slice(0,-1));
            }
        }
        if(!val) return [];
    }
    save(table, data) {
        let scoreboard = world.scoreboard.getObjective("PDB");
        if(!scoreboard) scoreboard = world.scoreboard.addObjective("PDB", "PrismarineDB");
        for(const participant of scoreboard.getParticipants()) {
            if(participant.displayName.startsWith(`@prismarine[${table}](`)) {
                scoreboard.removeParticipant(participant);
            }
        }
        scoreboard.setScore(`@prismarine[${table}](${JSON.stringify(data)})`)
    }
}