// Returns a merged array of two arrays without duplicates.
export function merge(arr1, arr2) {
    return [...new Set([...arr1, ...arr2])];
}

export function print (text) {
    console.log(`%c${text}`, 'background: #222; color: #bada55');
}

export function getDir () {
    let result = game.settings.get('ptr-fusion-maker', 'imageDirectory');
    if (result === "") result = game.settings.get('ptu', 'generation.defaultImageDirectory');
    return result;
}