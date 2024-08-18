import { Feature } from '../../../core/feature/feature';
import * as vscode from 'vscode';
import { Command, Action } from '../webview/app_helper';
const path = require('path');

export class MainPanelDelegate {

  protected openPanel({
    context,
    uri,
    title,
    column = vscode.ViewColumn.One,
    route,
    payload
  } : {
    context: vscode.ExtensionContext, 
    uri: vscode.Uri, 
    route: string,
    title: string, 
    column?: vscode.ViewColumn, 
    payload?: any
  }): vscode.WebviewPanel {

    const panel = vscode.window.createWebviewPanel(
      route+title,
      title,
      column,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'resources/main_panel'))]
      }
    );

    const appPath = vscode.Uri.file(path.join(context.extensionPath, 'resources/main_panel', 'index.js'));
    const appUri = panel.webview.asWebviewUri(appPath);

    panel.webview.html = this.getWebviewContent({ appUri, route, payload });

    panel.webview.onDidReceiveMessage(
     this.onDidReceiveMessage,
      undefined,
      context.subscriptions
    );

    return panel;
  }

  onDidReceiveMessage(command: Command) {

    switch (command.action) {
      case Action.showMessage:
        vscode.window.showInformationMessage(command.payload["message"]);
        return;
    }
  }

  private getWebviewContent({ appUri, route, payload }: {appUri: vscode.Uri, route: string, payload?: any}): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Dev Tools</title>

        <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                             img-src https:;
                             script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                             style-src vscode-resource: 'unsafe-inline';">
        
        <script>
          window.acquireVsCodeApi = acquireVsCodeApi;
          window.payload = ${JSON.stringify(payload)};
          window.route = '${route}';
        </script>
    </head>
    <body>
        <div id="root"></div>
        <script src="${appUri}"></script>
    </body>
    </html>`;
  }

  dispose(): void { }
}