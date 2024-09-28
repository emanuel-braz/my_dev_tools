import * as vscode from 'vscode';
import * as path from 'path';
import fs from 'fs';

export default class BarrelFileUtil {

    // Function to detect the programming language based on files in the directory
    static detectLanguage(folderPath: string): string | null {
        const files = fs.readdirSync(folderPath);
        let tsCount = 0;
        let dartCount = 0;
        const otherExtensionsCount: { [key: string]: number } = {};

        // Scan the files and count occurrences of language-specific files
        for (const file of files) {
            const fullPath = path.join(folderPath, file);

            try {
                const stats = fs.lstatSync(fullPath);
                if (stats.isDirectory()) {
                    // Recursive detection in subdirectories
                    const subLang = BarrelFileUtil.detectLanguage(fullPath);
                    if (subLang === '.ts') tsCount++;
                    if (subLang === '.dart') dartCount++;
                    if (subLang && subLang !== '.ts' && subLang !== '.dart') {
                        otherExtensionsCount[subLang] = (otherExtensionsCount[subLang] || 0) + 1;
                    }
                } else {
                    // Count files based on extensions and configuration files
                    if (/\.(ts|tsx|js)$/i.test(file) || file === 'tsconfig.json') {
                        tsCount++;
                    } else if (/\.dart$/i.test(file) || file === 'pubspec.yaml') {
                        dartCount++;
                    } else {
                        const ext = path.extname(file).toLowerCase();
                        if (ext) {
                            otherExtensionsCount[ext] = (otherExtensionsCount[ext] || 0) + 1;
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing file ${fullPath}: ${error.message}`);
            }
        }

        // Determine the language based on counts
        if (tsCount > dartCount && tsCount > Object.values(otherExtensionsCount).reduce((a, b) => a + b, 0)) return '.ts';
        if (dartCount > tsCount && dartCount > Object.values(otherExtensionsCount).reduce((a, b) => a + b, 0)) return '.dart';

        // Determine the most common other extension
        let maxCount = 0;
        let dominantExtension = null;
        for (const [ext, count] of Object.entries(otherExtensionsCount)) {
            if (count > maxCount) {
                maxCount = count;
                dominantExtension = ext;
            }
        }

        return dominantExtension || null; // Return the dominant extension or null if none found
    }
}