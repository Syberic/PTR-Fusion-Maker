import { ImageTools } from "../image-tools.js";
import { FusionHandler } from "../fusion-handler.js";

class FusionSelector extends FormApplication {
    constructor(pkmn) {
        super();
        this.pkmn = pkmn;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            template: `modules/ptr-fusion-maker/templates/fusionSelector.hbs`,
            id: 'fusion-selector',
            title: 'Fusion Selector',
            height: 485
        });
    }

    getData() {
        return {
            options: Object.keys(this.pkmn),
            defaultImage: "https://fusioncalc.com/wp-content/themes/twentytwentyone/pokemon/question.png",
            initialValue: Object.keys(this.pkmn)[0]
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        let p1Element = html[2].querySelector('[id="p1"]');
        let p2Element = html[2].querySelector('[id="p2"]');

        let listen = async (event) => {
            // Grab values from both.
            let p1 = html[2].querySelector('[id="p1"]').value;
            let p2 = html[2].querySelector('[id="p2"]').value;

            // Grab reference to both images.
            let result1 = html[2].querySelector('[id="pkmn-image1"]');
            let result2 = html[2].querySelector('[id="pkmn-image2"]');
            let url1 = await ImageTools.getSpriteURL(this.pkmn[p1], this.pkmn[p2]);
            let url2 = await ImageTools.getSpriteURL(this.pkmn[p2], this.pkmn[p1]);
            result1.src = url1;
            result2.src = url2;

            // Styling so that custom sprites are highlighted in green, like
            // in the game and the calculator.
            result1.style.backgroundColor = url1.includes("japeal") ? "white" : "#e3fed2";
            result2.style.backgroundColor = url2.includes("japeal") ? "white" : "#e3fed2";
        }

        p1Element.addEventListener("change", listen);
        p2Element.addEventListener("change", listen);
    }

    async _updateObject(event, formData) {
        console.log(event);
        console.log(formData);
        console.log(event.submitter.value);
        // Call the function to make the pokemon with the given image address.
        let head = formData.p1;
        let body = formData.p2;
        if (event.submitter.value == "right") {
            let temp = head;
            head = body;
            body = temp;
        }

        ImageTools.getImageSelection(head, body, this.pkmn);
    }
}

export default FusionSelector;