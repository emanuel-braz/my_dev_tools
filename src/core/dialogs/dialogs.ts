import { window, ExtensionContext, QuickPickItem } from 'vscode';
import { MARK_SIGN } from '../consts/app_consts';
import { APP_PLACEHOLDER_NOTIFICATION, APP_PLACEHOLDER_ROUTE } from '../consts/strings';
import { LocalDataSource } from '../data/local_data_source';

class Snackbar {

    static info(text: string = '') {
        window.showInformationMessage(text);
    }

    static error(text: string = '') {
        window.showErrorMessage(text);
    }

    static warn(text: string = '') {
        window.showWarningMessage(text);
    }
}

export class Dialogs {

    static snackbar = Snackbar;

    static async getRoute(context: ExtensionContext, isAndroid: Boolean = true, suggestions: string[] = []): Promise<string> {
        try {
            const placeholder = APP_PLACEHOLDER_ROUTE;
            const route = await Dialogs.prompt(context, suggestions, `${isAndroid ? "(android)" : "(ios)"} ${placeholder}`);
            if (route && (route as string).length > 0) {
                return route as string;
            } else {
                return "";
            }
        } catch (error) {
            return "";
        }
    }

    static async getNotificationFile(context: ExtensionContext, isAndroid: Boolean = true, suggestions: string[] = []): Promise<string | null> {
        try {
            const placeholder = APP_PLACEHOLDER_NOTIFICATION;
            const file = await Dialogs.prompt(context, suggestions, `${isAndroid ? "(android)" : "(ios)"} ${placeholder}`);
            if (file && (file as string).length > 0) {
                return file as string;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    static async prompt(context: ExtensionContext, options: Array<string>, placeHolder: string = "") {

        let promise = new Promise((resolve, reject) => {

            const quickPick = window.createQuickPick();
            quickPick.placeholder = placeHolder;
            quickPick.items = options.map(label => ({ label }));
            quickPick.ignoreFocusOut = true;

            quickPick.onDidChangeSelection((selection: QuickPickItem[]) => {
                const valueSelected = selection[0].label;
                const index = options.indexOf(valueSelected);
                LocalDataSource.updateLastLink(context, index);
                resolve(valueSelected);
                quickPick.dispose();
            });

            quickPick.onDidAccept(_ => {
                let valueSelected = quickPick.value;
                if (valueSelected.startsWith(MARK_SIGN)) {
                    valueSelected = valueSelected.substring(1);
                } else if (valueSelected.endsWith(MARK_SIGN)) {
                    valueSelected = valueSelected.substring(0, valueSelected.length - 1);
                }
                const index = options.indexOf(valueSelected);
                if (index == -1) {
                    LocalDataSource.updateLink(context, valueSelected);
                } else {
                    LocalDataSource.updateLastLink(context, index);
                }
                resolve(valueSelected);
                quickPick.dispose();
            });

            quickPick.onDidHide(() => {
                quickPick.dispose();
            });

            quickPick.show();
        });

        return promise;
    }

    static async promptAndReturn(context: ExtensionContext, options: Array<string>, placeHolder: string = ""): Promise<string> {

        let promise = new Promise<string>((resolve, reject) => {

            const quickPick = window.createQuickPick();
            quickPick.placeholder = placeHolder;
            quickPick.items = options.map(label => ({ label }));
            quickPick.ignoreFocusOut = true;

            quickPick.onDidChangeSelection((selection: QuickPickItem[]) => {
                const valueSelected = selection[0].label;
                resolve(valueSelected);
                quickPick.dispose();
            });

            quickPick.onDidAccept(_ => {
                let valueSelected = quickPick.value;
                resolve(valueSelected);
                quickPick.dispose();
            });

            quickPick.onDidHide(() => {
                quickPick.dispose();
            });

            quickPick.show();
        });

        return promise;
    }

    static async showInformationMessage(context: ExtensionContext, message: string, options: string[], defaultValue?: string ): Promise<string> {
        let promise = new Promise<string>((resolve, reject) => {
            window.showInformationMessage(message, ...options).then((selection) => {
                if (selection) {
                    resolve(selection);
                } else {
                    if (defaultValue) {
                        resolve(defaultValue);
                    } else {
                        reject();
                    }
                }
            });
        });
        return promise;
    }

    static async confirmDialog(context: ExtensionContext, message: string, items: string[], defaultValue?: string ): Promise<string> {

        let promise = new Promise<string>((resolve, reject) => {
            window.showQuickPick(items, { placeHolder: message }).then((selection) => {
                if (selection) {
                    resolve(selection);
                } else {
                    if (defaultValue) {
                        resolve(defaultValue);
                    } else {
                        reject();
                    }
                }
            });
        });

        return promise;
    }

}