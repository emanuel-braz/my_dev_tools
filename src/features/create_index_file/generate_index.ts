import * as vscode from 'vscode';
import * as path from 'path';
import { generateTypeScriptExports } from './languages/typescript';
import { generateDartExports } from './languages/dart';

export async function handleCreateIndexFile(uri: vscode.Uri) {
  if (!uri || !uri.fsPath || !vscode.workspace.fs.stat(uri).then(stat => stat.type !== vscode.FileType.Directory)) {
    vscode.window.showErrorMessage('Please select a valid folder.');
    return;
  }

  // Prompt the user to select a language
  const language = await vscode.window.showQuickPick(['TypeScript', 'Dart'], {
    placeHolder: 'Select the programming language for the index file',
  });

  if (!language) {
    vscode.window.showErrorMessage('No language selected.');
    return;
  }

  const folderPath = uri.fsPath;
  const indexPath = path.join(folderPath, language === 'TypeScript' ? 'index.ts' : 'index.dart');

  try {
    const exports =
      language === 'TypeScript'
        ? generateTypeScriptExports(folderPath)
        : generateDartExports(folderPath);

    await vscode.workspace.fs.writeFile(vscode.Uri.file(indexPath), Buffer.from(exports));
    vscode.window.showInformationMessage(`Index file created at ${indexPath}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error creating index file: ${error}`);
  }
}
