import vscode, { window } from 'vscode';
import { Feature } from '../../infra/feature/feature';
import WebviewUtil from '../../core/webview/webview_util';
import { Action } from '../../core/helpers/app_helper';
import { GistFile } from '../gists/gist_types';
import axios from 'axios';
import { GistDelegate } from '../gists/gist_delegate';

export default class SidePaneDelegate implements Feature {

  private disposableRefreshMainPanel: vscode.Disposable;
  private provider: MyViewProvider;

  activate(context: vscode.ExtensionContext) {

    this.provider = new MyViewProvider(context, 'main');

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('mainSidePanel', this.provider,
        { webviewOptions: { retainContextWhenHidden: true } }
      )
    );
  }

  deactivate() {
    this.disposableRefreshMainPanel.dispose();
    this.provider.deactivate();
  }
}

class MyViewProvider implements vscode.WebviewViewProvider, Feature {

  refreshMainPanelDisposable: vscode.Disposable;
  messageListenerDisposable: vscode.Disposable;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly route: string,
    private readonly payload?: any
  ) { }

  activate(context: vscode.ExtensionContext): void {
    console.log('MyViewProvider activated');
  }

  deactivate(): void {
    this.messageListenerDisposable.dispose();
    this.refreshMainPanelDisposable.dispose();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    viewResolveContext: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {

    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = WebviewUtil.getWebviewProviderContent(
      {
        context: this.context,
        webviewView: webviewView,
        route: this.route,
        payload: this.payload
      }
    );

    this.messageListenerDisposable = webviewView.webview.onDidReceiveMessage(message => {
      switch (message.action) {
        case Action.runGist:
          SidePanelHelper.runGistFile(this.context, message.payload.file, message.payload.inCurrentTerminal);
          return;
        case Action.refreshMainPanel:
          SidePanelHelper.loadFavoriteGistData(this.context, webviewView);
          return;
      }
    });

    this.refreshMainPanelDisposable = vscode.commands.registerCommand('extension.refreshMainPanel', async () => {
      SidePanelHelper.loadFavoriteGistData(this.context, webviewView);
    });
  }
}

class SidePanelHelper {

  static async loadFavoriteGistData(context: vscode.ExtensionContext, webviewView: vscode.WebviewView): Promise<void> {
    webviewView.webview.postMessage({ action: Action.fechingFavoriteGist, payload: { isLoading: true } });

    const gistDelegate = new GistDelegate();
    const gist = await gistDelegate.getFavoriteGist(context);
    if (!gist) {
      vscode.window.showErrorMessage('Failed to fetch favorite gist');
      return;
    }

    webviewView.webview.postMessage({ action: Action.refreshMainPanel.toString(), payload: gist });
  }

  static async fetchData<T>(url: string): Promise<T> {
    return window.withProgress({
      location: vscode.ProgressLocation.Notification,
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

  static async runGistFile(context: vscode.ExtensionContext, file: GistFile, inCurrentTerminal: boolean): Promise<void> {
    const gistDelegate = new GistDelegate();
    const rawFileContent = await gistDelegate.fetchRawFileContent(file.raw_url);
    gistDelegate.runGistOnTerminal(context, rawFileContent, inCurrentTerminal);
  }
}