import { Feature } from '../../infra/feature/feature';
import * as vscode from 'vscode';
import path from 'path';
import { generateTypeScriptExports } from './languages/typescript';
import { generateDartExports } from './languages/dart';
import fs from 'fs';
import detectLanguage from './util';

export default class CreateIndexFileDelegate implements Feature {
  activate(context: vscode.ExtensionContext) {
    const createIndexFile = vscode.commands.registerCommand('extension.createIndexFile', async (uri: vscode.Uri) => {

      const detectedLanguage = detectLanguage(uri.fsPath);

      let language: string | undefined;
      // Determine the file name based on the user's choice
      const folderName = path.basename(uri.fsPath);

      if (!detectedLanguage) {
        // If the detected language is null, prompt the user to choose the programming language
        language = await vscode.window.showQuickPick(['TypeScript', 'Dart'], {
          placeHolder: 'Choose the programming language',
        });

        if (!language) {
          return;
        }
      } else {
        language = detectedLanguage;
      }

      // Prompt the user to choose the file naming convention
      const fileName = await vscode.window.showQuickPick([`${folderName}.${language === 'TypeScript' ? 'ts' : 'dart'}`, `index.${language === 'TypeScript' ? 'ts' : 'dart'}`], {
        placeHolder: 'Choose file naming convention',
      });

      if (!fileName) {
        return;
      }

      // Choose the correct export function based on the selected language
      const exportFunction = language === 'TypeScript' ? generateTypeScriptExports : generateDartExports;
      const exportContent = exportFunction(uri.fsPath);

      // Create the export file with the chosen name
      const exportFilePath = path.join(uri.fsPath, fileName);
      fs.writeFileSync(exportFilePath, exportContent);

      vscode.window.showInformationMessage(`File ${fileName} created successfully.`);
    });

    context.subscriptions.push(createIndexFile);
  }

  deactivate() { }
}
