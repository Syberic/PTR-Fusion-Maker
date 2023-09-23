import pkmn from "../resources/pokemonDictionary.json" assert { type: "json" };

export class ImageTools {
    static customSpriteURL = "custom-fusion-sprites-main/CustomBattlers/";
    static generatedSpriteURL = "autogen-fusion-sprites-master/Battlers/";
    static baseURL = "https://fusioncalc.com/wp-content/themes/twentytwentyone/pokemon/";
    static proxyURL = "https://corsproxy.io/?";
    
    static async downloadImage (url, dexNumber) {
        let resp = await fetch(`${ImageTools.proxyURL}${url}`);
        let blob = await resp.blob();
        let file = new File([blob], `${dexNumber}.webp`);
        let directory = await game.settings.get("ptu", "generation.defaultImageDirectory"); // Change this later maybe.
        await FilePicker.upload("data", `./${directory}`, file);
        await ImageTools.createShinyImage(blob, `./${directory}`, `${dexNumber}s.webp`);
    }

    static urlExists (url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', `${ImageTools.proxyURL}${url}`, false);
        http.send();
        if (http.status != 404)
            return true;
        else
            return false;
    }

    static getSpriteURL (p1, p2) {
        let customFound = true;
        // Attempt Custom
        let url = `${ImageTools.baseURL}${ImageTools.customSpriteURL}${pkmn[p1]}.${pkmn[p2]}.png`;
        if (!ImageTools.urlExists(url)) {
            customFound = false;
            // Attempt regular
            url = `${ImageTools.baseURL}${ImageTools.generatedSpriteURL}${pkmn[p1]}/${pkmn[p1]}.${pkmn[p2]}.png`;
        }
        if (!ImageTools.urlExists(url)) {
            // Default
            url = `${ImageTools.baseURL}question.png`;
        }
        return [url, customFound];
    }

    static rgbToHSL (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s
        ? l === r
            ? (g - b) / s
            : l === g
            ? 2 + (b - r) / s
            : 4 + (r - g) / s
        : 0;
        return [
            60 * h < 0 ? 60 * h + 360 : 60 * h,
            100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
            (100 * (2 * l - s)) / 2,
        ];
    }

    static hslToRGB (h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [255 * f(0), 255 * f(8), 255 * f(4)];
    }

    static createShinyImage (blob, folder, name) {
        let img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
    
        let canvas = document.createElement('canvas');
    
        img.onload = () => {
            let canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
    
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
            for (let i = 0; i < imageData.data.length; i += 4) {
                let hsl = ImageTools.rgbToHSL(imageData.data[i], imageData.data[i+1], imageData.data[i+2]);
    
                hsl[0] = (hsl[0] + 40) % 360; // Shift by 40
    
                let rgb = ImageTools.hslToRGB(hsl[0], hsl[1], hsl[2]);
    
                imageData.data[i] = rgb[0];
                imageData.data[i+1] = rgb[1];
                imageData.data[i+2] = rgb[2];
            }
            
            ctx.putImageData(imageData, 0, 0);
    
            canvas.toBlob(newBlob => {
                let newFile = new File([newBlob], name, {type: "image/webp"});
                FilePicker.upload("data", folder, newFile);
            });
        }
    }
}