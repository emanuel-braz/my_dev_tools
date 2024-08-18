import { MainPanelDelegate } from "../main_panel_delegate";
import { Feature } from '../../../../core/feature/feature';
import * as vscode from 'vscode';
import { Command, Action } from "../../webview/app_helper";
const path = require('path');

export class GistPanelDelegate extends MainPanelDelegate implements Feature {

    commandOpenWebview: vscode.Disposable;
    commandUpdatePanel: vscode.Disposable;
    commandCreateStatusBarButton: vscode.StatusBarItem;
    panel: vscode.WebviewPanel | undefined;
  
    activate(context: vscode.ExtensionContext): void {
      this.commandOpenWebview =  vscode.commands.registerCommand('extension.mainPanel', (uri: vscode.Uri) => {
        this. panel = this.openPanel({
          context,
          uri: uri,
          route: 'gist',
          title: 'My Dev Tools',
          column: vscode.ViewColumn.One,
          payload: { message: 'Hello from VSCode' }
        });
      });
      
      this.commandUpdatePanel =  vscode.commands.registerCommand('extension.updateGistPanel', (uri: vscode.Uri) => {
        const command: Command = {
            action: Action.showMessage,
            payload: {
                "title": "Hello from React",
                "message": "This is a message from React to VSCode",
                "type": "info"
            }
        };

        this.panel.webview.postMessage(command);
      });
    
      context.subscriptions.push(this.commandOpenWebview);
  
      this.commandCreateStatusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
      this.commandCreateStatusBarButton.text = '$(zap) Show Gists';
      this.commandCreateStatusBarButton.command = 'extension.updateGistPanel';
      this.commandCreateStatusBarButton.show();
  
      context.subscriptions.push(this.commandCreateStatusBarButton);
    }
  
    deactivate(): void {
        this.commandOpenWebview.dispose();
        this.commandUpdatePanel.dispose();
        this.commandCreateStatusBarButton.dispose();
        this.panel?.dispose();
        super.dispose();  
    }
  }