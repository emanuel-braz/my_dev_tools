import { ExtensionContext } from "vscode";
import { Feature } from "../../../infra/feature/feature";
import * as vscode from 'vscode';
import { PanelDelegate } from "../../panels/extension/panel_delegate";

export default class NotesDelegate  extends PanelDelegate implements Feature {

    commandOpenWebview: vscode.Disposable;
    panel: vscode.WebviewPanel | undefined;
    
    activate(context: ExtensionContext): void {
        this.commandOpenWebview = vscode.commands.registerCommand('extension.openNotes', (uri: vscode.Uri) => {
            this.panel = this.openPanel({
              context,
              uri: uri,
              route: 'notes',
              title: 'My Notes',
              column: vscode.ViewColumn.Two,
              payload: { message: 'Hello from VSCode' }
            });
          });
          context.subscriptions.push(this.commandOpenWebview);
    }
    
    deactivate(): void {}
}