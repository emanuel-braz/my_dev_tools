import * as fs from 'fs';
import * as path from 'path';

export function generateDartExports(dir: string, baseDir: string = dir): string {
  let exportStatements = '';
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    console.log(`Processing: ${fullPath}`);

    try {
      const stats = fs.lstatSync(fullPath);
      if (stats.isDirectory()) {
        exportStatements += generateDartExports(fullPath, baseDir);
      } else if (
        /\.dart$/i.test(file) && // Include only .dart files
        !/index\.dart$/i.test(file) && // Exclude index.dart
        !/\.g\.dart$/i.test(file) && // Exclude .g.dart files
        !/\.freezed\.dart$/i.test(file) // Exclude .freezed.dart files
      ) {
        const exportPath = `./${relativePath}`;
        exportStatements += `export '${exportPath}';\n`;
      }
    } catch (error) {
      console.error(`Error processing file ${fullPath}: ${error.message}`);
    }
  });

  return exportStatements;
}
