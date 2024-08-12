import { Feature } from './../../../core/feature/feature';
import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode';

export class TicTacToeDelegate implements Feature {

    activate(context: vscode.ExtensionContext) {

        let play = vscode.commands.registerCommand('extension.startTictactoe', () => {
            vscode.window.showQuickPick(["Player vs Player", "Player vs Computer"]).then((value) => {
                if (value === "Player vs Player") {
                    this.startGame(context, "pvp");
                }
                else {
                    this.startGame(context, "pve");
                }
            });
        });
        context.subscriptions.push(play);
    }

    deactivate() {
        console.log("Deactivating TicTacToe");
    }

    startGame(context: vscode.ExtensionContext, type: string) {
        const panel = vscode.window.createWebviewPanel(
            'tictactoe',
            `Tic Tac Toe (${type.toUpperCase()})`,
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'resources/games/tictactoe', type === "pvp" ? 'pvp.html' : "pve.html"));
        panel.webview.html = fs.readFileSync(filePath.fsPath, 'utf8');

        vscode.window.showInformationMessage("Let's begin! Your move X");

        function restartGame(response: string | undefined) {
            if (response == "Yes") {
                panel.webview.postMessage({ command: 'restart' });
            }
            else {
                panel.dispose()
            }
        }

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'info':
                        vscode.window.showInformationMessage(message.text);
                        return;
                    case 'play-again':
                        vscode.window.showInformationMessage(message.text, "Yes", "No").then(response => restartGame(response));
                }
            },
            undefined,
            context.subscriptions
        );
    }
}