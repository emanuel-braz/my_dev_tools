import { commands, ExtensionContext, ProgressLocation, QuickPickItem, window } from "vscode";
import axios from 'axios';
import { Dialogs } from "../../core/dialogs/dialogs";

export interface GistFile extends QuickPickItem {
    filename: string;
    type: string;
    language: string | null;
    raw_url: string;
    size: number;
}

export interface Gist extends QuickPickItem {
    id: string;
    description: string;
    html_url: string;
    files: { [key: string]: GistFile };
    public: boolean;
    created_at: string;
    updated_at: string;
}

export class GistDelegate {

    static NEXT_TERM_ID = 0;

    async runGistFile(context: ExtensionContext) {

        const urlRawFile = await Dialogs.showInputBox({
            prompt: 'Enter the raw URL of the file to run on terminal',
            placeHolder: 'https://gist.githubusercontent.com/username/gist_id/raw/file_name',
        });

        if (!urlRawFile) {
            return;
        }

        const rawFileContent = await this.fetchRawFileContent(urlRawFile);

        this._runGistOnTerminal(context, rawFileContent);
    }

    async runGistFromUser(context: ExtensionContext) {

        const userName = await Dialogs.showInputBox({        
            prompt: 'Enter the Gist username to fetch the files',
            placeHolder: 'example: emanuel-braz',
            value: 'emanuel-braz'
    });

        if (!userName) {
            return;
        }

        const gistList = await this.fetchData<Gist[]>(`https://api.github.com/users/${userName}/gists`);

        if (!gistList || gistList.length === 0) {
            window.showInformationMessage('No Gists found for this user');
            return;
        }

        const gist: Gist | undefined = await Dialogs.showQuickPick(context, gistList.map(gist => {
            return {
                label: gist.description,
                id: gist.id,
                files: gist.files,
                public: gist.public,
                created_at: gist.created_at,
                updated_at: gist.updated_at
            } as Gist;
        }), 'Select a Gist') as Gist;

        if (!gist) {
            return;
        }

        const filesAsQuickPickItems = Object.keys(gist.files).map(key => {
            const file = gist.files[key];
            return {
                label: file.filename,
                description: `${file.type} - ${file.language} - ${file.size} bytes`,
                filename: file.filename,
                type: file.type,
                raw_url: file.raw_url,
            } as GistFile;
        });

        const file: GistFile | undefined = await Dialogs.showQuickPick(
            context,
            filesAsQuickPickItems,
            'Select a file'
        ) as GistFile;

        if (!file) {
            return;
        }

        const rawFileContent = await this.fetchRawFileContent(file.raw_url);

        this._runGistOnTerminal(context, rawFileContent);
    }

    private async _runGistOnTerminal(context: ExtensionContext, fileRawData: string) {
        const terminal = window.createTerminal(`[MDT] #${GistDelegate.NEXT_TERM_ID++}`);
        terminal.show();

       if (fileRawData.startsWith('#!')) {
            terminal.sendText(`bash -c '${fileRawData}'`);
        } else {
            terminal.sendText(fileRawData);
        }
    }

    async fetchRawFileContent(url: string): Promise<string> {
        return window.withProgress({
            location: ProgressLocation.Notification,
            title: "Fetching Raw File",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: "Starting..." });

            try {
                progress.report({ increment: 50, message: "Fetching data from URL..." });
                const response = await axios.get(url, { responseType: 'json' });

                progress.report({ increment: 100, message: "Data fetched successfully!" });
                return response.data;
            } catch (error) {
                window.showErrorMessage(`Error fetching raw file from URL ${url}: ${error}`);
                throw new Error('Failed to fetch raw file content');
            }
        });
    }

    async fetchData<T>(url: string): Promise<T> {
        return window.withProgress({
            location: ProgressLocation.Notification,
            title: "Fetching data",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: "Starting..." });

            try {
                progress.report({ increment: 50, message: "Fetching data from URL..." });
                const response = await axios.get<T>(url, { responseType: 'json' });

                progress.report({ increment: 100, message: "Data fetched successfully!" });
                return response.data;
            } catch (error) {
                window.showErrorMessage(`Error fetching data from URL ${url}: ${error}`);
                throw new Error('Failed to fetch data');
            }
        });
    }
}
