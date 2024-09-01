import * as vscode from 'vscode';
import * as path from 'path';
import fs from 'fs';


// Function to detect the programming language based on files in the directory
export default function detectLanguage(folderPath: string): 'TypeScript' | 'Dart' | null {
    const files = fs.readdirSync(folderPath);
    let tsCount = 0;
    let dartCount = 0;

    // Scan the files and count occurrences of language-specific files
    for (const file of files) {
        const fullPath = path.join(folderPath, file);

        try {
            const stats = fs.lstatSync(fullPath);
            if (stats.isDirectory()) {
                // Recursive detection in subdirectories
                const subLang = detectLanguage(fullPath);
                if (subLang === 'TypeScript') tsCount++;
                if (subLang === 'Dart') dartCount++;
            } else {
                // Count files based on extensions and configuration files
                if (/\.(ts|tsx|js)$/i.test(file) || file === 'tsconfig.json') {
                    tsCount++;
                } else if (/\.dart$/i.test(file) || file === 'pubspec.yaml') {
                    dartCount++;
                }
            }
        } catch (error) {
            console.error(`Error processing file ${fullPath}: ${error.message}`);
        }
    }

    // Determine the language based on counts
    if (tsCount > dartCount) return 'TypeScript';
    if (dartCount > tsCount) return 'Dart';

    return null; // Return null if no dominant language is detected
}