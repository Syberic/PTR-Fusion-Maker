/**
 * An application that runs some code and then immediately expires.
 */

class ResetDexApp extends FormApplication {
    render(force=false, options={}) {
        let prevDexNum = game.settings.get('ptr-fusion-maker', 'dexNumberCurrent');
        let dexNum = game.settings.get('ptr-fusion-maker', 'dexNumber');
        game.settings.set('ptr-fusion-maker', 'dexNumberCurrent', dexNum);
        ui.notifications.info(`Set the current dex number to ${dexNum}, was ${prevDexNum}.`);
    }
}

export default ResetDexApp;