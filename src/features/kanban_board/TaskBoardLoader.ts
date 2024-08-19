import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IConfig, ICommand, CommandAction } from './app/model';
import { deepFind } from './app/Utils';
import { TASKBOARD_DEFAULT_FILE, TASKBOARD_FILE_LIST } from '../../core/consts/app_consts';

let __panel: vscode.WebviewPanel | null = null;
let selectedFile = '';

export default class ViewLoader {
  private _panel: vscode.WebviewPanel | undefined;
  private _extensionPath: string = '';
  private _disposables: vscode.Disposable[] = [];

  constructor(extensionPath: string, uri: vscode.Uri) {
    this.init(extensionPath, uri);
  }

  async init(extensionPath: string, uri: vscode.Uri) {

    const configuration = vscode.workspace.getConfiguration();
    const filesOnWorkspace = await this.findBoardFilesInWorkspace(extensionPath, uri);
    const filesConfigured: string | undefined = configuration.get(TASKBOARD_FILE_LIST);
    const defaultFile = TASKBOARD_DEFAULT_FILE;
    let fileList: string[] = [];

    if (filesOnWorkspace.length > 0) {
      fileList = filesOnWorkspace;
    }

    if (filesConfigured) {
      const newFiles = filesConfigured.split(',').map(str => str.trim());
      fileList = fileList.concat(newFiles);
    }

    if (fileList.length === 0) {
      fileList.push(defaultFile);
    }

    // distinct
    fileList = fileList.filter((value, index, self) => self.indexOf(value) === index);

    selectedFile = fileList[0];

    this._extensionPath = extensionPath;
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Two
      : undefined;

    this._panel = vscode.window.createWebviewPanel('task_board', 'Task Board', column || vscode.ViewColumn.Two, {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'resources/task_board'))]
    });

    // get base path (from the user's workspace path):
    const rootPath = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
    // const templateFilePath = rootPath + '/TODO.board';
    let basePath = ''; // relative

    if (uri && uri.fsPath) {
      // path from Context Menu
      basePath = uri.fsPath.replace(rootPath, ''); // get relative path
    }

    const todoStr = '';

    this._panel.webview.html = this.getWebviewContent({
      basePath,
      templateString: todoStr || '',
      fileList,
      selectedFile,
      rootPath
    });

    __panel = this._panel;

    this._panel.webview.onDidReceiveMessage(
      (command: ICommand) => {
        switch (command.action) {
          case CommandAction.ShowMessage:
            vscode.window.showInformationMessage(command.content.description!);
            return;
          case CommandAction.OpenFile:
            const rootPath2 = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
            const filePath2 = rootPath2 + (selectedFile || TASKBOARD_DEFAULT_FILE);
            vscode.window.showTextDocument(vscode.Uri.file(filePath2));
            return;
          case CommandAction.Save:
            this.saveFileContent(command.content);
            return;
          case CommandAction.Load:
            selectedFile = command.content.description || TASKBOARD_DEFAULT_FILE;
            const rootPath3 = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
            const filePath3 = rootPath3 + selectedFile;
            const fileUri = vscode.Uri.file(filePath3);
            const todoStr = this.getFileContent(fileUri);
            this._panel!.webview.html = this.getWebviewContent({
              basePath,
              templateString: todoStr || '',
              fileList,
              selectedFile,
              rootPath
            });
            return;
        }
      },
      undefined,
      this._disposables
    );
  }

  private getWebviewContent({ basePath, templateString, fileList, selectedFile, rootPath }): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'resources/task_board', 'index.js'));
    const reactAppUri = reactAppPathOnDisk.with({ scheme: 'vscode-resource' });

    const fullPath = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + `/${selectedFile}`;

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Board</title>

        <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                             img-src https:;
                             script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                             style-src vscode-resource: 'unsafe-inline';">
        <script>
          window.acquireVsCodeApi = acquireVsCodeApi;
          window.initialData = { name: 'TaskBoard', path: \`${basePath}\`, dataString: \`${templateString}\`, fileList: \`${fileList}\`, selectedFile: \`${selectedFile}\` };
        </script>
    </head>
    <body>
        <div id="root"></div>

        <script src="${reactAppUri}"></script>
    </body>
    </html>`;
  }

  private getFileContent(fileUri: vscode.Uri) {
    if (fs.existsSync(fileUri.fsPath)) {
      let content = fs.readFileSync(fileUri.fsPath, 'utf8');
      return content;
    }
    return undefined;
  }

  private saveFileContent(config: IConfig) {
    const content = config.description;
    const rootPath = deepFind(vscode, 'workspace.workspaceFolders[0].uri.fsPath', '') + '/';
    const filePath = rootPath + (selectedFile || TASKBOARD_DEFAULT_FILE);

    const uri = vscode.Uri.file(filePath);
    fs.writeFileSync(uri.fsPath, content);
  }


  async findBoardFilesInWorkspace(extensionPath: string, uri: vscode.Uri): Promise<string[]> {
    try {
      let matchingFiles: string[] = [];
      const files = await this.findBoardFiles(extensionPath, extensionPath);
      matchingFiles = matchingFiles.concat(files);

      return matchingFiles;
    } catch (error) {
      return [];
    }
  }

  findBoardFiles(dir: string, extensionPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) {
          return reject(`Error reading directory: ${dir}`);
        }

        let matchingFiles: string[] = [];
        let pending = files.length;

        if (!pending) return resolve([]);

        files.forEach((file) => {
          const fullPath = path.join(dir, file.name);

          if (file.isDirectory()) {
            this.findBoardFiles(fullPath, extensionPath).then((res) => {
              matchingFiles = matchingFiles.concat(res);
              if (!--pending) resolve(matchingFiles);
            });
          } else {
            if (file.isFile() && file.name.endsWith('.board')) {

              const relativePath = path.relative(extensionPath || '', fullPath);
              matchingFiles.push(relativePath);
            }
            if (!--pending) resolve(matchingFiles);
          }
        });
      });
    });
  }
}
