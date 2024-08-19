import { Feature } from '../../../infra/feature/feature';
import * as vscode from 'vscode';
import { Command, Action } from '../../../core/helpers/app_helper';
import WebviewUtil from '../../../core/webview/webview_util';
const path = require('path');

export class PanelDelegate {

  protected openPanel({
    context,
    uri,
    title,
    column = vscode.ViewColumn.One,
    route,
    payload
  }: {
    context: vscode.ExtensionContext,
    uri: vscode.Uri,
    route: string,
    title: string,
    column?: vscode.ViewColumn,
    payload?: any
  }): vscode.WebviewPanel {

    const panel = vscode.window.createWebviewPanel(
      route + title,
      title,
      column,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'resources/panels'))]
      }
    );

    panel.webview.html = WebviewUtil.getWebviewContent({ context, route, panel, payload });

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

  dispose(): void { }
}