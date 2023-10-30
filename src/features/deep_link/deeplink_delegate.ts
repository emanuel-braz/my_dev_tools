import { ExtensionContext } from "vscode";
import { LocalDataSource } from "../../core/data/local_data_source";
import { ANDROID_EXEC, IOS_EXEC } from "../../core/consts/app_consts";
import { Platform } from "../../core/platform/platform";
import { Dialogs } from "../../core/dialogs/dialogs";
import { Runner } from "../../core/runners/runner";
import { APP_DEEPLINK_ANDROID, APP_DEEPLINK_IOS } from "../../core/consts/strings";

export default class DeeplinkDelegate {

    // Runs the command for the current platform
    // If isLastPrompt is true, it will run the first suggestion from the cache
    // If isLastPrompt is false, it will prompt the user for a deeplink
    async runPlatformCommand(context: ExtensionContext, isAndroid: Boolean, isLastPrompt: Boolean = false) {
        // Writes to cache the current platform
        LocalDataSource.updateIsAndroid(context, isAndroid);

        // Checks if the executable is available, if not, throws an error
        if (!Platform.checkIfExecutableIsAvailable(isAndroid ? ANDROID_EXEC : IOS_EXEC)) return;

        // Gets the deeplink suggestions from cache
        const suggestions = LocalDataSource.getLinks(context);

        if (isLastPrompt == true && suggestions.length > 0) {
            this.runCommand(suggestions[0], isAndroid);
        } else {
            let route = await Dialogs.getRoute(context, isAndroid, suggestions);
            this.runCommand(route, isAndroid);
        }
    }

    runCommand(route: string, isAndroid: Boolean) {
        const runner = new Runner();
        if (route.length > 0) {
            if (isAndroid) {
                console.log(`${APP_DEEPLINK_ANDROID} ${route}`);
                runner.runAndroid(route);
            } else {
                console.log(`${APP_DEEPLINK_IOS} ${route}`);
                runner.runIos(route);
            }
        }
    }
}