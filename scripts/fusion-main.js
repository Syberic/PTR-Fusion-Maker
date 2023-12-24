import { ImageTools } from "./image-tools.js";
import { FusionHandler } from "./fusion-handler.js";
import pkmn from "../resources/pokemonDictionary.json" assert { type: "json" };
import ResetDexApp from "./reset-dex-app.js";

Hooks.on("init", () => {
    
    // Settings

    // Sprite Folder
    game.settings.register('ptr-fusion-maker', 'imageDirectory', {
        name: 'Image Directory',
        hint: "The directory to look for and create images in. If empty images will be made in PTR's default directory.",
        scope: 'world',
        config: true,
        type: String,
        default: ""
    });

    // OpenAI Key
    /*
    game.settings.register('ptr-fusion-maker', 'openaiKey', {
        name: 'OpenAI Key',
        hint: 'Your OpenAI Key for generation. If blank this feature goes unused. Ensure that you and only you have access to these configuration settings. If your key leaks, its your fault.',
        scope: 'world',
        config: true,
        type: String,
        default: ""
    });
    */

    // Default Description
    game.settings.register('ptr-fusion-maker', 'defaultDescription', {
        name: 'Default Description',
        hint: 'The default description given in PokeDex entries for Fusion Pokemon.',
        scope: 'world',
        config: true,
        type: String,
        default: "This is a Fusion Pokemon."
    });

    // Current Dex Number
    game.settings.register('ptr-fusion-maker', 'dexNumberCurrent', {
        name: 'Current Dex Number',
        scope: 'world',
        config: false,
        type: Number,
        default: 6000
    });

    // Starting Dex Number
    game.settings.register('ptr-fusion-maker', 'dexNumber', {
        name: 'Starting Dex Number',
        hint: 'The PokeDex number that Fusion Pokemon will start at. Defaults to 6000, alter this if you have Pokemon going past this number. This will also reset the current active dex number when changed.',
        scope: 'world',
        config: true,
        type: Number,
        default: 6000,
        onChange: (value) => game.settings.set('ptr-fusion-maker', 'dexNumberCurrent', value)
    });

    game.settings.registerMenu("ptr-fusion-maker", "dexReset", {
        name: "Reset Current Dex Number",
        label: "Reset Dex Number",
        hint: "Resets the current Pokedex number for fusion pokemon to the current starting value.",
        type: ResetDexApp,
        restricted: true
    });

    // Modify PTU to make use of the directory if available.
    
    CONFIG.PTU.Item.documentClasses.species.prototype.getImagePath = async function ({ gender = game.i18n.localize("PTU.Male"), shiny = false, extension = game.settings.get("ptu", "generation.defaultImageExtension"), suffix = "" }={}) {
        let path = game.settings.get('ptr-fusion-maker', 'imageDirectory');
        const useName = game.settings.get("ptu", "generation.defaultPokemonImageNameType");
        const femaleTag = gender.toLowerCase() == "female" ? "f" : "";
        const shinyTag = shiny ? "s" : "";

        let fullPath = `${path.startsWith('/') ? "" : "/"}${path}${path.endsWith('/') ? "" : "/"}${useName ? this.slug : Handlebars.helpers.lpad(this.system.number, 3, 0)}${femaleTag}${shinyTag}${this.system.form ? ("_" + this.system.form) : ""}${suffix ?? ""}${extension.startsWith('.') ? "" : "."}${extension}`;
        let result = await fetch(fullPath);
        if (result.status != 404) return fullPath;

        path = game.settings.get("ptu", "generation.defaultImageDirectory");

        return `${path.startsWith('/') ? "" : "/"}${path}${path.endsWith('/') ? "" : "/"}${useName ? this.slug : Handlebars.helpers.lpad(this.system.number, 3, 0)}${femaleTag}${shinyTag}${this.system.form ? ("_" + this.system.form) : ""}${suffix ?? ""}${extension.startsWith('.') ? "" : "."}${extension}`;
    }
    
    game.ptu.species.generator.getImage = async function (species, { gender = game.i18n.localize("PTU.Male"), shiny = false, extension = game.settings.get("ptu", "generation.defaultImageExtension"), suffix = "" } = {}) {
        // Check for default
        let path = await species.getImagePath({ gender, shiny, extension, suffix });
        let result = await fetch(path)
        if (result.status != 404) return path;

        // Default with webp
        path = await species.getImagePath({ gender, shiny, extension: "webp", suffix });
        result = await fetch(path);
        if (result.status != 404) return path;

        // look for male images
        if (gender != game.i18n.localize("PTU.Male")) {
            // Check default with Male
            path = await species.getImagePath({ shiny, suffix });
            result = await fetch(path);
            if (result.status != 404) return path;

            // Male with webp
            path = await species.getImagePath({ shiny, extension: "webp", suffix });
            result = await fetch(path);
            if (result.status != 404) return path;
        }

        //look for non-shiny images
        if (shiny) {
            path = await species.getImagePath({ gender, suffix });
            result = await fetch(path)
            if (result.status != 404) return path;

            path = await species.getImagePath({ gender, extension: "webp", suffix });
            result = await fetch(path);
            if (result.status != 404) return path;

            //look for male non-shiny images
            if (gender != game.i18n.localize("PTU.Male")) {
                path = await species.getImagePath({ suffix });
                result = await fetch(path);
                if (result.status != 404) return path;
        
                path = await species.getImagePath({ extension: "webp", suffix });
                result = await fetch(path);
                if (result.status != 404) return path;
            }
        }

        //all again but ignoring the custom suffix
        if (suffix) return await this.getImage(species, {gender, shiny, extension});

        return undefined;
    }
    
});

function fuserDialogue () {
    (async () => {
        let dialogContent = `
            <img class="pkmn-image1" src="${ImageTools.baseURL}question.png" width="300" height="300"/>
            <img class="pkmn-image2" src="${ImageTools.baseURL}question.png" width="300" height="300"/>
            <br>
            <div/>
            <div>
                <input style="text-align: center" list="dlPkmn" id="p1" name="p1" value="${Object.keys(pkmn)[0]}"/>
                <input style="float: right; margin-right: 0.5%; text-align: center" list="dlPkmn" id="p2" name="p2" value="${Object.keys(pkmn)[0]}"/>
            </div>
            <div style="margin-top: 20; margin-bottom: 20">
                <p>Input the names of two Pokemon above, must be valid for Infinite Fusion.</p>
                <p>Pokemon with a green background indicate ones with custom sprites.</p>
                <p>Content not possible without the work of spriters in the Infinite Fusion community; as well as SDM0 and Aegido's <a href="https://aegide.github.io/">calculator</a>.</p>
            </div>
            <br>
        `;
        let d = new Dialog({
            title: "Fusion",
            content: dialogContent,
            buttons: {
                submit: {
                    label: "Create Left",
                    callback: (html) => {
                        FusionHandler.fusePokemon(html, false, pkmn);
                    }
                },
                cancel: {
                    label: "Create Right",
                    callback: (html) => {
                        FusionHandler.fusePokemon(html, true, pkmn);
                    }
                }
            },
            default: "submit",
            render: (html) => {
                // Sets up the data list on render. This allows for auto-filling text input.
                let dl = document.createElement("datalist");
                dl.id = "dlPkmn";
                for (let pk in pkmn) {
                    let option = document.createElement("option");
                    option.value = pk;
                    dl.appendChild(option);
                }
                // Set up listeners on inputs, so when an input changes we fetch the resulting image.
                let p1Element = html[0].querySelector('[id="p1"]');
                let p2Element = html[0].querySelector('[id="p2"]');
                p1Element.appendChild(dl);
                p2Element.appendChild(dl);
                let listen = async (event) => {
                    // Grab values from both.
                    let p1 = html[0].querySelector('[id="p1"]').value;
                    let p2 = html[0].querySelector('[id="p2"]').value;
                    // Grab reference to both images.
                    let result1 = html[0].querySelector('[class="pkmn-image1"]');
                    let result2 = html[0].querySelector('[class="pkmn-image2"]');
                    let [url1, isCustom1] = ImageTools.getSpriteURL(p1, p2);
                    let [url2, isCustom2] = ImageTools.getSpriteURL(p2, p1);
                    result1.src = url1;
                    // Styling so that custom sprites are highlighted in green, like
                    // in the game; and in the calculator.
                    if (isCustom1)
                        result1.style.backgroundColor = "#e3fed2";
                    else
                        result1.style.backgroundColor = "transparent";
                    result2.src = url2;
                    if (isCustom2)
                        result2.style.backgroundColor = "#e3fed2";
                    else
                        result2.style.backgroundColor = "transparent";
                };
                p1Element.addEventListener("change", listen);
                p2Element.addEventListener("change", listen);
           }
        }, {
            width: 630,
            height: 490   
        })
        d.render(true)
    })();
}

Hooks.on("getSceneControlButtons", (controls) => {
    if (!game.user.isGM) return; // Lock out non-players.
    const tokenControls = controls.find((c) => {
        return c.name === "token";
    });
    if (tokenControls && Object.prototype.hasOwnProperty.call(tokenControls, "tools")) {
        tokenControls.tools.push({
            button: true,
            name: "fuser",
            title: "Fuser",
            icon: "fas fa-arrows-spin",
            onClick: fuserDialogue
        });
    }
})

