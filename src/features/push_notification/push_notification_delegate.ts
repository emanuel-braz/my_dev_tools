import { ExtensionContext } from "vscode";
import { LocalDataSource } from "../../core/data/local_data_source";
import { ANDROID_EXEC, IOS_EXEC, LOCAL_NOTIFICATION_EXAMPLE_FILE_ANDROID, LOCAL_NOTIFICATION_EXAMPLE_FILE_IOS, LOCAL_NOTIFICATION_FOLDER } from "../../core/consts/app_consts";
import { Platform } from "../../core/platform/platform";
import { Runner } from "../../core/runners/runner";
import { Dialogs } from "../../core/dialogs/dialogs";

const fs = require('fs');
const path = require('path');

export default class PushNotificationDelegate {
    async pushNotification(context: ExtensionContext, isAndroid: Boolean, reRunLastNotification: Boolean = false) {
        // Writes to cache the current platform
        LocalDataSource.updateIsAndroid(context, isAndroid);

        // Checks if the executable is available, if not, throws an error
        if (!Platform.checkIfExecutableIsAvailable(isAndroid ? ANDROID_EXEC : IOS_EXEC)) return;

        if (reRunLastNotification == true) {
            // Gets last notification from cache
            const lastNotification = LocalDataSource.getLastNotificationFile(context);

            if (lastNotification != null) {
                const runner = new Runner();

                if (isAndroid) {
                    runner.pushNotificationAndroid(lastNotification);
                } else {
                    runner.pushNotificationIOS(lastNotification);
                }
            } else {
                Dialogs.snackbar.error("No previous notification found");
            }
        } else {
            // get all files inside folder ./local_notifications
            const files = Platform.getFiles(context, LOCAL_NOTIFICATION_FOLDER);

            // if there are no files, create a new one inside the folder ./local_notifications
            if (files.length == 0) {

                const folderPath = path.join(context.extensionPath, LOCAL_NOTIFICATION_FOLDER);

                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);
                }

                if (isAndroid) {
                    fs.writeFileSync(path.join(folderPath, LOCAL_NOTIFICATION_EXAMPLE_FILE_ANDROID), `{
    "to": "<token>",
    "data": {
        "message": "Push notification body!",
        "_od": "<data>"
    },
    "_od": "<data>"
}`);
                } else {
                    fs.writeFileSync(path.join(folderPath, LOCAL_NOTIFICATION_EXAMPLE_FILE_IOS), `{
    "aps": {
        "alert": {
            "title": "Push notification title",
            "body": "Push notification body!",
            "sound": "default",
            "_od": "<data>"
        },
        "badge": 10,
        "_od": "<data>"
    },
    "_od": "<data>",
    "Simulator Target Bundle": "br.com.packagename" // Use your app Bundle ID here
}`);
                }

                Dialogs.snackbar.info(`A example file "${isAndroid ? LOCAL_NOTIFICATION_EXAMPLE_FILE_ANDROID : LOCAL_NOTIFICATION_EXAMPLE_FILE_IOS}" for ${isAndroid ? 'Android' : 'iOS'} was created! Please, edit it and try again.`);
                return;
            }

            const file = await Dialogs.getNotificationFile(context, isAndroid, files);

            if (file == null) {
                Dialogs.snackbar.error("No notification file selected");
                return;
            }

            const runner = new Runner();
            const folderPath = path.join(context.extensionPath, LOCAL_NOTIFICATION_FOLDER);
            const filePath = path.join(folderPath, file);

            LocalDataSource.updateLastNotificationFile(context, filePath);

            if (isAndroid) {
                runner.pushNotificationAndroid(filePath);
            } else {
                runner.pushNotificationIOS(filePath);
            }
        }
    }

}