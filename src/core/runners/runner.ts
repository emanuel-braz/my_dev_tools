import { Dialogs } from './../dialogs/dialogs';
const { exec } = require("child_process");

export class Runner {

    runAndroid(route: string = "") {
        return this.run(`adb shell am start '-W -a android.intent.action.VIEW -d "${route}"'`);
    }

    runIos(route: string) {
        return this.run(`xcrun simctl openurl booted ${route}`);
    }

    async pushNotificationIOS(file: string): Promise<boolean> {
        const result = await this.run(`xcrun simctl push booted ${file}`);
        return result;
    }
    
    pushNotificationAndroid(file: string) {
        Dialogs.snackbar.error('Not implemented yet, sorry :(');
    }

    run(command: string): Promise<boolean> {
        command = this.encodeAmpersandChars(command);
        return new Promise<boolean>((resolve, reject) => {
            exec(command, (error: any, stdout: any, stderr: any) => {
                if (stderr) {
                    Dialogs.snackbar.error(stderr);
                    resolve(false);
                } else if (error) {
                    Dialogs.snackbar.error(error);
                    resolve(false);
                } else {
                    console.log(`${stdout}`);
                    resolve(true);
                }
            });
        });
    }
    
    encodeAmpersandChars(command: string): string {
        let ampersand = /&/gi;
        return command.replace(ampersand, "\\" + "&");
    }
}