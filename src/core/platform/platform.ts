import * as vscode from 'vscode';
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

    static getFiles(folder: string) : string[] {
        try {
            let currDir = Platform.getCurrentPath();
            const folderPath = path.join(currDir, folder);
            const files = fs.readdirSync(folderPath?.toString());
            return files;
        } catch(e){
            return [];
        }
    }

    static getCurrentPath() : string | undefined {
        return vscode.workspace.workspaceFolders?.[0].uri.fsPath.toString();
    }
}