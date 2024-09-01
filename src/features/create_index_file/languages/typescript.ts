import * as fs from 'fs';
import * as path from 'path';

export function generateTypeScriptExports(dir: string, baseDir: string = dir): string {
  let exportStatements = '';
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    console.log(`Processing: ${fullPath}`);

    try {
      const stats = fs.lstatSync(fullPath);
      if (stats.isDirectory()) {
        exportStatements += generateTypeScriptExports(fullPath, baseDir);
      } else if (/\.(ts|tsx|js)$/i.test(file) && !/index\.(ts|tsx|js)$/i.test(file) && !/\.d\.ts$/i.test(file)) {
        // Excludes .d.ts files and index files
        const exportPath = `./${relativePath.replace(/\.(ts|tsx|js)$/, '')}`;
        exportStatements += `export * from '${exportPath}';\n`;
      }
    } catch (error) {
      console.error(`Error processing file ${fullPath}: ${error.message}`);
    }
  });

  return exportStatements;
}
