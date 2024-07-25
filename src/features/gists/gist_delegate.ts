import { commands, ExtensionContext, ProgressLocation, QuickPickItem, QuickPickItemButtonEvent, ThemeIcon, Uri, window, workspace } from "vscode";
import axios from 'axios';
import { Dialogs } from "../../core/dialogs/dialogs";
import { Platform } from "../../core/platform/platform";
import { ButtonCallback, Gist, GistFile, SecretGistFile } from "./gist_types";
import { LocalDataSource } from "../../core/data/local_data_source";

export class GistDelegate {

    static NEXT_TERM_ID = 0;

    async runGistFile(context: ExtensionContext) {

        const secretFiles = await this.getSecretFilesFromDisk(context);

        const quickPickItems = secretFiles.map((file: SecretGistFile) => {
            return {
                label: file.name,
                description: file.url,
            } as QuickPickItem;
        });

        const secretGistFile = await Dialogs.showQuickPick(context, quickPickItems, 'Select a Secret Gist');

        if (!secretGistFile || !secretGistFile.description) {
            return;
        }

        const rawFileContent = await this.fetchRawFileContent(secretGistFile.description);

        this._runGistOnTerminal(context, rawFileContent);
    }

    async runGistUrl(context: ExtensionContext) {

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
                label: gist.description || `${gist.files[Object.keys(gist.files)[0]].filename} - ${gist.updated_at || gist.created_at}`,
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
                label: `$(console) RUN: ${file.filename}`,
                description: `${file.type} - ${file.size} bytes`,
                filename: file.filename,
                type: file.type,
                raw_url: file.raw_url,
                buttons: [
                    {
                        iconPath: new ThemeIcon('files'),
                        tooltip: 'Copy to clipboard',
                        callback: async () => {
                            const rawFileContent = await this.fetchRawFileContent(file.raw_url);
                            Platform.copyToClipboard(rawFileContent);
                            Dialogs.snackbar.info('File content copied to clipboard!');
                        }
                    } as ButtonCallback,
                    {
                        iconPath: new ThemeIcon('link-external'),
                        tooltip: 'Open in editor',
                        callback: async () => {
                            const rawFileContent = await this.fetchRawFileContent(file.raw_url);
                            const document = await workspace.openTextDocument({
                                content: rawFileContent,
                                language: 'plaintext' 
                            });
                    
                            await window.showTextDocument(document);
                        }
                    } as ButtonCallback
                ]
            } as GistFile;
        });

        const file: GistFile | undefined = await Dialogs.promptAndReturn(
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

    private async getSecretFilesFromDisk(context: ExtensionContext): Promise<SecretGistFile[]> {
        const GIST_FILE = 'gist.json';
        const GIST_FOLDER = '.mdt';
        var fileData = Platform.getFileContent(GIST_FOLDER, GIST_FILE);

        if (!fileData || fileData.trim().length === 0) {
            fileData = `[
    {
        "name": "My Public Gist",
        "url": "https://gist.githubusercontent.com/emanuel-braz/9adf6e767b2439ffbc60ce7bb0f459ad/raw/4755e1a6236ff81726c8ea1f6e04bac4de1fba38/echo_1.sh"
    },
    {
        "name": "My Secret Gist",
        "url": "https://gist.githubusercontent.com/emanuel-braz/d89b7007b52efa6148a9513594ef3356/raw/1a86e67d6fea973ccab9fed5551b6406ccb97813/my_secret_gist.sh"
    }
]`;

            Platform.writeFileContent(GIST_FOLDER, GIST_FILE, fileData);
            Dialogs.snackbar.info(`File created: ${GIST_FOLDER}/${GIST_FILE}`);
            Dialogs.snackbar.info(`Please, fill the file with the secret gists.`);
        }

        const fileJson = JSON.parse(fileData);
        return fileJson;
    }

    async runFavoriteGist(context: ExtensionContext) {

        var favoriteGistUrl = LocalDataSource.getFavoriteGistUrl(context);

        if (!favoriteGistUrl) {
            favoriteGistUrl = await this.updateFavoriteGist(context);
            if (!favoriteGistUrl) {
                Dialogs.snackbar.error('Favorite Gist not set');
                return;
            }
        }

        const gistId = favoriteGistUrl.split('/').pop();
        const api = `https://api.github.com/gists/${gistId}`;

        const gist = await this.fetchData<Gist>(api);
        
        const filesAsQuickPickItems = Object.keys(gist.files).map(key => {
            const file = gist.files[key];
            return {
                label: `$(console) RUN: ${file.filename}`,
                description: `${file.type} - ${file.language} - ${file.size} bytes`,
                filename: file.filename,
                type: file.type,
                raw_url: file.raw_url,
                buttons: [
                    {
                        iconPath: new ThemeIcon('files'),
                        tooltip: 'Copy to clipboard',
                        callback: async () => {
                            const rawFileContent = await this.fetchRawFileContent(file.raw_url);
                            Platform.copyToClipboard(rawFileContent);
                            Dialogs.snackbar.info('File content copied to clipboard!');
                        }
                    } as ButtonCallback,
                    {
                        iconPath: new ThemeIcon('link-external'),
                        tooltip: 'Open in editor',
                        callback: async () => {
                            const rawFileContent = await this.fetchRawFileContent(file.raw_url);
                            const document = await workspace.openTextDocument({
                                content: rawFileContent,
                                language: 'plaintext' 
                            });
                    
                            await window.showTextDocument(document);
                        }
                    } as ButtonCallback
                ]
            } ;
        });

        const file: GistFile | undefined = await Dialogs.promptAndReturn(
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
    
    async updateFavoriteGist(context: ExtensionContext): Promise<string | undefined> {
        const favoriteGistUrl = await Dialogs.showInputBox({
            prompt: 'Enter the URL of the favorite Gist',
            placeHolder: 'https://gist.github.com/username/gist_id',
        });

        if (!favoriteGistUrl || favoriteGistUrl.trim().length === 0 || !favoriteGistUrl.startsWith('https://gist.github.com/')) {
            return;
        }
        
        LocalDataSource.setFavoriteGistUrl(context, favoriteGistUrl);
        return favoriteGistUrl;
    }

    clearFavoriteGist(context: ExtensionContext) {
        LocalDataSource.setFavoriteGistUrl(context, '');
    }

}