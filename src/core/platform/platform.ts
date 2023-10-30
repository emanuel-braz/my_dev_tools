import { ExtensionContext } from 'vscode';
import { APP_EXEC_NOT_FOUND } from '../consts/strings';
import { Dialogs } from '../dialogs/dialogs';
const fs = require('fs');
const path = require('path');

export class Platform {
    static checkIfExecutableIsAvailable(exec: string): Boolean {
        const isAvailable = require('hasbin').sync(exec);
        if (isAvailable != true) {
            Dialogs.snackbar.error(APP_EXEC_NOT_FOUND.replace("{exec}", exec));
        }
        return isAvailable;
    }

    static getFiles(context: ExtensionContext, folder: string) : string[] {
        try {
            const folderPath = path.join(context.extensionPath, folder);
            const files = fs.readdirSync(folderPath);
            return files;
        } catch(e){
            return [];
        }
    }
}