import * as vscode from 'vscode';
const path = require('path');

export default class WebviewUtil {
    static getWebviewContent({ context, route, panel, payload }: { context: vscode.ExtensionContext, route: string, panel: vscode.WebviewPanel, payload?: any }): string {

        const appPath = vscode.Uri.file(path.join(context.extensionPath, 'resources/panels', 'index.js'));
        const appUri = panel.webview.asWebviewUri(appPath);

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

    static getWebviewProviderContent({ context, webviewView, route, payload }:
        {
            context: vscode.ExtensionContext,
            webviewView: vscode.WebviewView,
            route: string,
            payload?: any
        }): string {

        const appPath = vscode.Uri.file(path.join(context.extensionPath, 'resources/panels', 'index.js'));
        const appUri = webviewView.webview.asWebviewUri(appPath);

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
}