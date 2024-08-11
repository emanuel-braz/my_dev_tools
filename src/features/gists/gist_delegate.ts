import { env, ExtensionContext, ProgressLocation, QuickPickItem, Terminal, ThemeIcon, Uri, window, workspace } from "vscode";
import axios from 'axios';
import { Dialogs } from "../../core/dialogs/dialogs";
import { Platform } from "../../core/platform/platform";
import { ButtonCallback, Gist, GistFile, SecretGistFile } from "./gist_types";
import { LocalDataSource } from "../../core/data/local_data_source";
import { GENERATED_FILES_FOLDER } from "../../core/consts/app_consts";

const fs = require('fs');
const os = require('os');
const path = require('path');


export class GistDelegate {

    static NEXT_TERM_ID = 0;

    async runGistFromDisk(context: ExtensionContext) {

        const secretFiles = await this.getSecretFilesFromDisk(context);

        const quickPickItems = secretFiles.map((file: SecretGistFile) => {
            return {
                label: file.name,
                description: file.url,
            } as QuickPickItem;
        });

        const gist = await Dialogs.showQuickPick(context, quickPickItems, 'Select a Gist');

        if (!gist || !gist.description) {
            return;
        }

        this.runGistFromUrl(context, gist.description);
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
                updated_at: gist.updated_at,
                html_url: gist.html_url,
                owner: gist.owner,
            } as Gist;
        }), 'Select a Gist') as Gist;

        if (!gist) {
            return;
        }

        const filesAsQuickPickItems = Object.keys(gist.files).map(key => {
            const file = gist.files[key];
            return {
                label: `$(run-below) RUN: ${file.filename}`,
                description: `${file.type} - ${file.size} bytes`,
                filename: file.filename,
                type: file.type,
                raw_url: file.raw_url,
                buttons: [
                    {
                        // @ts-ignore:
                        iconPath: new ThemeIcon('console'),
                        tooltip: 'Run in a new terminal',
                        callback: async () => {
                            const rawFileContent = await this.fetchRawFileContent(file.raw_url);
                            this._runGistOnTerminal(context, rawFileContent, false);
                        }
                    } as ButtonCallback,
                    {
                        // @ts-ignore:
                        iconPath: new ThemeIcon('files'),
                        tooltip: 'Copy to clipboard',
                        callback: async () => {
                            const rawFileContent = await this.fetchRawFileContent(file.raw_url);
                            Platform.copyToClipboard(rawFileContent);
                            Dialogs.snackbar.info('File content copied to clipboard!');
                        }
                    } as ButtonCallback,
                    {
                        // @ts-ignore:
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
            'Select a file',
            [
                {
                    // @ts-ignore:
                    iconPath: new ThemeIcon('globe'),
                    tooltip: 'Open in browser',
                    callback: async () => {
                        env.openExternal(Uri.parse(gist.html_url));
                    }
                } as ButtonCallback,
            ],
            `${gist.public ? '🔓' : '🔒'} ${gist.owner.login} ${gist.public ? '(public)' : '(secret)'}`,
        ) as GistFile;

        if (!file) {
            return;
        }

        const rawFileContent = await this.fetchRawFileContent(file.raw_url);

        this._runGistOnTerminal(context, rawFileContent, true);
    }

    private async _runGistOnTerminal(context: ExtensionContext, fileRawData: string, isCurrentTerminal: boolean = false) {

        if (fileRawData.startsWith('#!')) {
            if (fileRawData.length > 1024) {
                this.sendLargeTextToTerminal(fileRawData, isCurrentTerminal);
            } else {
                const terminal: Terminal  = isCurrentTerminal ? (window.activeTerminal || window.createTerminal(`[MDT] #${GistDelegate.NEXT_TERM_ID++}`)) : window.createTerminal(`[MDT] #${GistDelegate.NEXT_TERM_ID++}`);
                terminal.show();
                terminal.sendText(`bash -c '${fileRawData}'`);
            }
        } else {
            if (fileRawData.length > 1024) {
                this.sendLargeTextToTerminal(fileRawData, isCurrentTerminal);
            } else {
                const terminal: Terminal  = isCurrentTerminal ? (window.activeTerminal || window.createTerminal(`[MDT] #${GistDelegate.NEXT_TERM_ID++}`)) : window.createTerminal(`[MDT] #${GistDelegate.NEXT_TERM_ID++}`);
                terminal.show();
                terminal.sendText(fileRawData);
            }
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
                const response = await axios.get(url, { responseType: 'text' });

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
        var fileData = Platform.getFileContent(GENERATED_FILES_FOLDER, GIST_FILE);

        if (!fileData || fileData.trim().length === 0) {
            fileData = `[
    {
        "name": "My Secret Gist",
        "url": "https://gist.github.com/emanuel-braz/d89b7007b52efa6148a9513594ef3356"
    },
    {
        "name": "My Secret Gist",
        "url": "https://gist.github.com/emanuel-braz/d89b7007b52efa6148a9513594ef3356"
    }
]`;

            Platform.writeFileContent(GENERATED_FILES_FOLDER, GIST_FILE, fileData);
            Dialogs.snackbar.info(`File created: ${GENERATED_FILES_FOLDER}/${GIST_FILE}`);
            Dialogs.snackbar.info(`Please, fill the file with the secret gists.`);
        }

        const fileJson = JSON.parse(fileData);
        return fileJson;
    }

    async inputGistUrlAndRun(context: ExtensionContext) {
        const url = await Dialogs.showInputBox({
            prompt: 'Enter the URL of the Gist',
            placeHolder: 'https://gist.github.com/username/gist_id',
        });

        if (!url || url.trim().length === 0 || !url.startsWith('https://gist.github.com/')) {
            Dialogs.snackbar.error('Invalid Gist URL');
            return;
        }

        this.runGistFromUrl(context, url);
    }

    async runFavoriteGist(context: ExtensionContext) {
        var url = LocalDataSource.getFavoriteGistUrl(context);
        if (!url) {
            url = await this.updateFavoriteGist(context);
            if (!url) {
                Dialogs.snackbar.error('Favorite Gist not set');
                return;
            }
        }

        this.runGistFromUrl(context, url);
    }

    async runGistFromUrl(context: ExtensionContext, url: string) {

        const gistId = url.split('/').pop();
        const api = `https://api.github.com/gists/${gistId}`;

        const gist = await this.fetchData<Gist>(api);
        
        const filesAsQuickPickItems = Object.keys(gist.files).map(key => {
            const file = gist.files[key];
            return {
                label: `$(run-below) RUN: ${file.filename}`,
                description: `${file.type} - ${file.language} - ${file.size} bytes`,
                filename: file.filename,
                type: file.type,
                raw_url: file.raw_url,
                buttons: [
                    {
                        // @ts-ignore:
                        iconPath: new ThemeIcon('console'),
                        tooltip: 'Run in a new terminal',
                        callback: async () => {
                            const rawFileContent = await this.fetchRawFileContent(file.raw_url);
                            this._runGistOnTerminal(context, rawFileContent, false);
                        }
                    } as ButtonCallback,
                    {
                        // @ts-ignore:
                        iconPath: new ThemeIcon('files'),
                        tooltip: 'Copy to clipboard',
                        callback: async () => {
                            const rawFileContent = await this.fetchRawFileContent(file.raw_url);
                            Platform.copyToClipboard(rawFileContent);
                            Dialogs.snackbar.info('File content copied to clipboard!');
                        }
                    } as ButtonCallback,
                    {
                        // @ts-ignore:
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
            'Select a file',
            [
                {
                    // @ts-ignore:
                    iconPath: new ThemeIcon('globe'),
                    tooltip: 'Open in browser',
                    callback: async () => {
                        env.openExternal(Uri.parse(gist.html_url));
                    }
                } as ButtonCallback,
            ],
            `${gist.public ? '🔓' : '🔒'} ${gist.owner.login} ${gist.public ? '(public)' : '(secret)'}`,
        ) as GistFile;

        if (!file) {
            return;
        }

        const rawFileContent = await this.fetchRawFileContent(file.raw_url);
        this._runGistOnTerminal(context, rawFileContent, true);
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

    sendLargeTextToTerminal(text: string, isCurrentTerminal: boolean = false) {
        const tempFilePath = path.join(os.tmpdir(), 'gist_temp_file.sh');
        fs.writeFileSync(tempFilePath, text, { mode: 0o755 });
    
        const terminal: Terminal  = isCurrentTerminal ? (window.activeTerminal || window.createTerminal(`[MDT] #${GistDelegate.NEXT_TERM_ID++}`)) : window.createTerminal(`[MDT] #${GistDelegate.NEXT_TERM_ID++}`);
        terminal.show(true);
        terminal.sendText(`bash ${tempFilePath}`, true);
    }

}
