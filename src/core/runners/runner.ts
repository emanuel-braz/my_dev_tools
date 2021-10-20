import { Dialogs } from './../dialogs/dialogs';
const { exec } = require("child_process");

export class Runner {

    runAndroid(route: string = "") {
        return this.run(`adb shell am start -W -a android.intent.action.VIEW -d ${route}`);
    }

    runIos(route: string) {
        return this.run(`xcrun simctl openurl booted ${route}`);
    }

    run(command: string) {
        command = this.encodeAmpersandChars(command);
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
    
    encodeAmpersandChars(command: string): string {
        let ampersand = /&/gi;
        return command.replace(ampersand, "\\" + "&");
    }
}