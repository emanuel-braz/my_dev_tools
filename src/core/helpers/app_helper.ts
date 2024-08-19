
export enum Action {
    showMessage = 'showMessage',
    refreshMainPanel = 'refreshMainPanel',
    runGist = 'runGist',
    fechingFavoriteGist = 'fechingFavoriteGist',
}

export interface Command {
    action: string;
    payload?: any;
}

export class AppHelper {
    private static _instance: AppHelper;

    constructor(private vscode: any, public route: string, public payload: any) {
        AppHelper._instance = this;
    }

    public static get instance(): AppHelper {
        return AppHelper._instance;
    }

    public postMessage(command: Command) {
        this.vscode.postMessage(command);
    }
}