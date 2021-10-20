import { Dialogs } from './../dialogs/dialogs';
const { exec } = require("child_process");

export class Runner {

    static runAndroid(route: string = "") {
        return run(`adb shell am start -W -a android.intent.action.VIEW -d ${route}`);
    }

    static runIos(route: string) {
        return run(`xcrun simctl openurl booted ${route}`);
    }
}

function run(command: string) {
    return exec(command, (error: any, stdout: any, stderr: any) => {
        if (stderr) {
            Dialogs.snackbar.error(stderr);
        } else if (error) {
            Dialogs.snackbar.error(error);
        }
        
        if (stdout) {
            console.log(`${stdout}`);
        }
    });
}