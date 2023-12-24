import { FusionHandler } from "../fusion-handler.js";

class ImageSelector extends FormApplication {
    constructor(head, body, imgList) {
        super();
        this.head = head;
        this.body = body;
        this.imgList = imgList
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            template: `modules/ptr-fusion-maker/templates/imageSelector.hbs`,
            id: 'image-selector',
            title: 'Image Selector',
        });
    }

    getData() {
        return {
            images: this.imgList,
            width: 4 * 240 + 10,
            height: Math.ceil(this.imgList.length / 2) * 240 + 40,
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _updateObject(event, formData) {
        let url = event.submitter.value;
        // Call the function to make the pokemon with the given image address.
        FusionHandler.fusePokemon(this.head, this.body, url);
    }
}

export default ImageSelector;