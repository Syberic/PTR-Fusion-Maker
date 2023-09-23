import { ImageTools } from "./image-tools.js";
import capabilitiesTypes from "../resources/capabilitiesTypes.json" assert { type: "json" };
import { merge } from "./utils.js";

export class FusionHandler {

    static async fusePokemon (html, invert, pkmn) {
        // Grab the given inputs.
        let head = html[0].querySelector('[id="p1"]').value;
        let body = html[0].querySelector('[id="p2"]').value;
        // Determine which one to do.
        if (invert) {
            let temp = head;
            head = body;
            body = temp;
        }
        // Grab the newest available dex number. This will always append to the end, so if there is a gap in dex numbers
        // it will not fill it. Might have to go back to old methods.
        let dexNumber = await game.settings.get('ptr-fusion-maker','dexNumberCurrent');
        // Checks if the file already exists, later on want to implement a way to 'cache' a file for a species,
        // so that way this code has more use behind it.
        let url = ImageTools.getSpriteURL(head, body)[0];
        await ImageTools.downloadImage(url, dexNumber);
        await this.createSpeciesEntry(head, body, dexNumber);
        ui.notifications.info("Fusion Pokemon is done!", {permanent: true});
    }
    
    static async abilities (head, body) {
        let abilities = {
            basic: [],
            advanced: [],
            high: []
        }
        for (let tier in abilities) {
            abilities[tier] = merge(head.system.abilities[tier], body.system.abilities[tier]);
        }
        return abilities;
    }

    static async breeding (head, body) {
        let breeding = {
            eggGroups: "",
            genderRatio: 0,
            hatchRate: 0
        }
        breeding.eggGroups = body.system.breeding.eggGroups;
        breeding.genderRatio = Math.round((body.system.breeding.genderRatio.genderRatio + head.system.breeding.genderRatio.genderRatio)/2);
        breeding.hatchRate = Math.round((body.system.breeding.genderRatio.genderRatio + head.system.breeding.genderRatio.hatchRate)/2);
        return breeding;
    }

    static async capabilities (head, body) {
        let capabilities = body.system.capabilities;
        let headCapabilities = head.system.capabilities.other.filter(e => e.slug in capabilitiesTypes ? (capabilitiesTypes[e.slug] === "head" ? true : false) : true);
        let bodyCapabilities = head.system.capabilities.other.filter(e => e.slug in capabilitiesTypes ? (capabilitiesTypes[e.slug] === "body" ? true : false) : true);
        capabilities.other = merge(headCapabilities, bodyCapabilities);
        capabilities.levitate = Math.max(head.system.capabilities.levitate, body.system.capabilities.levitate);
        return capabilities;
    }

    // Need to be fixed later to remove repeating moves. Otherwise works fine.
    static async moves (head, body) {
        let moves = {
            egg: [],
            level: [],
            machine: [],
            tutor: []
        }
        for (let list in moves) {
            moves[list] = merge(head.system.moves[list], body.system.moves[list]).sort((a, b) => a.level > b.level ? 1 : (a.level < b.level ? -1 : 0));
        }
        return moves;
    }

    static async skills (head, body) {
        let skills = {};
        for (let skill in head.system.skills) {
            if (head.system.skills[skill].type === "body") {
                skills[skill] = body.system.skills[skill];
            }
            else {
                skills[skill] = head.system.skills[skill];
            }
        }
        return skills;
    }

    static async stats (head, body) {
        let stats = {
            atk: "body",
            def: "body",
            hp: "head",
            spatk: "head",
            spd: "body",
            spdef: "head"
        }
        for (let stat in stats) {
            stats[stat] = Math.round(((2/3) * (stats[stat] === "body" ? body : head).system.stats[stat]) + ((1/3) * (stats[stat] === "body" ? head : body).system.stats[stat]));
        }
        return stats;
    }

    static async types (head, body) {
        let firstType = head.system.types[0];
        let secondType = body.system.types[body.system.types.length == 2 ? 1 : 0];
        return [...new Set([firstType, secondType])];
    }

    // May need handling for evolutions (even if decided to not incorporate evolutions)
    static async createSpeciesEntry (head, body, dexNumber) {
        head = await game.ptu.item.get(head, "species");
        body = await game.ptu.item.get(body, "species");
        ui.notifications.warn("Creating Fusion Pokemon. Please wait...", {permanent: true});
        let monData = {
            name: head.name.substring(0, head.name.length/2 + 1) + body.name.substring(body.name.length/2).toLowerCase(),
            type: "species",
            system: {
                abilities: await this.abilities(head, body),
                breeding: await this.breeding(head, body),
                capabilities: await this.capabilities(head, body),
                dexentry: await game.settings.get('ptr-fusion-maker','defaultDescription'),
                diet: body.system.diet,
                habitats: body.system.habitats,
                moves: await this.moves(head, body),
                number: dexNumber,
                size: body.system.size,
                skills: await this.skills(head, body),
                stats: await this.stats(head, body),
                types: await this.types(head, body)
            }
        }
        await CONFIG.PTU.Item.documentClasses.species.create(monData);
        await game.settings.set('ptr-fusion-maker', 'dexNumberCurrent', dexNumber + 1);
    }
}