import minimatch = require('minimatch');
import { posix, sep } from 'path';
import { window, workspace } from 'vscode';

import { CONFIGURATIONS, DART_FILE_REGEX, TYPESCRIPT_FILE_REGEX, TYPESCRIPT_JSX_FILE_REGEX } from './constants';
import { readdirSync } from 'fs';

const path = { sep, posix };

type PosixPath = string;

/**
 * Converts a path to a generic `PosixPath`
 *
 * @param pathLike Path location
 * @returns An equal location with posix separators
 */
export const toPosixPath = (pathLike: string): PosixPath =>
  pathLike.split(path.sep).join(path.posix.sep);

/**
 * Converts a `PosixPath` to a OS specific path
 *
 * @param posixPath Current path
 * @returns A location path with os specific separators
 */
export const toOsSpecificPath = (posixPath: PosixPath): string =>
  posixPath.split(path.posix.sep).join(path.sep);

/**
 * Checks if a file is a dart file
 *
 * @param fileName The file name to evaluate
 * @returns If the file name is a valid dart file
 */
export const isDartFile = (fileName: string) => DART_FILE_REGEX.dart.test(fileName);

/**
 * Checks if a file is a typescript file
 *
 * @param fileName The file name to evaluate
 * @returns If the file name is a valid typescript file
 */
export const isTypescriptFile = (fileName: string) => TYPESCRIPT_FILE_REGEX.typescript.test(fileName);

/**
 * Checks if a file is a typescript file
 *
 * @param fileName The file name to evaluate
 * @returns If the file name is a valid typescript JSX file
 */
export const isTypescriptJsxFile = (fileName: string) => TYPESCRIPT_JSX_FILE_REGEX.typescriptJsx.test(fileName);

/**
 * Checks if a file has the name of the current folder barrel file
 *
 * @param dirName The directory name
 * @param fileName The file name to evaluate
 * @returns If the file name equals the name of the
 * barrel file
 */
export const isBarrelFile = (dirName: string, fileName: string) => DART_FILE_REGEX.base(dirName).test(fileName) || TYPESCRIPT_FILE_REGEX.base(dirName).test(fileName);

/**
 * Checks if the given file name matches the given glob
 *
 * @param fileName The file to check for
 * @param glob The glob to compare the string with
 * @returns Whether it matches the glob or not
 */
export const matchesGlob = (fileName: string, glob: string): boolean =>
  minimatch(fileName, glob);

/**
 * Sorts the file names alphabetically
 */
export const fileSort = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

/**
 * Shows a vscode dialog to select a folder to create a barrel file to
 *
 * @returns The selected path if any
 */
export const getFolderNameFromDialog = (): Thenable<string | undefined> =>
  window.showOpenDialog(CONFIGURATIONS.input).then((uri) =>
    uri && uri.length > 0
      ? // The selected input is in the first array position
      uri[0].path
      : undefined
  );

/**
 * Gets the list of files and a set of directories from the given path
 * without the path in the name.
 *
 * @param barrel The name of the barrel file
 * @param path The name of the path to check for
 */
export const getFilesAndDirsFromPath = (
  barrel: string,
  path: string
): [string[], Set<string>] => {
  const files = [];
  const dirs = new Set<string>();

  for (const curr of readdirSync(path, { withFileTypes: true })) {
    const fullPath = `${path}/${curr.name}`;
    if (curr.isFile()) {
      if (shouldExport(curr.name, fullPath, barrel)) {
        files.push(curr.name);
      }
    } else if (curr.isDirectory()) {
      if (shouldExportDirectory(fullPath)) {
        dirs.add(curr.name);
      }
    }
  }

  return [files, dirs];
};

/**
 * Gets the list of all the files from the current path and its
 * nested folders (including all subfolders)
 *
 * @param barrel The name of the barrel file
 * @param path The name of the path to check for
 */
export const getAllFilesFromSubfolders = (
  barrel: string,
  path: string
): string[] => {
  const resultFiles: string[] = [];
  const [files, dirs] = getFilesAndDirsFromPath(barrel, path);

  resultFiles.push(...files);

  if (dirs.size > 0) {
    for (const d of dirs) {
      const folderFiles = getAllFilesFromSubfolders(barrel, `${path}/${d}`);
      resultFiles.push(...folderFiles.map((f) => `${d}/${f}`));
    }
  }

  return resultFiles;
};

/**
 * Checks if the given `posixPath` is a supported file, it has a different
 * name than the folder barrel file and is not excluded by any configuration
 *
 * @param posixPath The path to check
 * @param dirName The current directory name
 * @returns If the given `posixPath` should be added to the list of
 * exports
 */
export const shouldExport = (
  fileName: PosixPath,
  filePath: PosixPath,
  dirName: string
): boolean => {

  if (!isBarrelFile(dirName, fileName)) {
    if (isDartFile(fileName)) {
      if (DART_FILE_REGEX.suffixed('freezed').test(fileName)) {
        // Export only if files are not excluded
        return !getConfig(CONFIGURATIONS.values.EXCLUDE_FREEZED);
      }

      if (DART_FILE_REGEX.suffixed('g').test(fileName)) {
        // Export only if files are not excluded
        return !getConfig(CONFIGURATIONS.values.EXCLUDE_GENERATED);
      }

      const globs: string[] =
        getConfig(CONFIGURATIONS.values.EXCLUDE_FILES) ?? [];
      return globs.every((glob) => !matchesGlob(filePath, glob));

    } else if (isTypescriptFile(fileName)) {
      if (TYPESCRIPT_FILE_REGEX.suffixed('d').test(fileName)) {
        // Export only if files are not excluded
        return !getConfig(CONFIGURATIONS.values.EXCLUDE_TYPESCRIPT_DECLARATION);
      }

      const globs: string[] =
        getConfig(CONFIGURATIONS.values.EXCLUDE_FILES) ?? [];
      return globs.every((glob) => !matchesGlob(filePath, glob));

    } else if (isTypescriptJsxFile(fileName)) {

      const includeTsxFiles: boolean =
        getConfig(CONFIGURATIONS.values.INCLUDE_TSX_FILES) ?? true;

      if (!includeTsxFiles) {
        return false;
      }

      if (TYPESCRIPT_JSX_FILE_REGEX.suffixed('d').test(fileName)) {
        // Export only if files are not excluded
        return !getConfig(CONFIGURATIONS.values.EXCLUDE_TYPESCRIPT_DECLARATION);
      }

      const globs: string[] =
        getConfig(CONFIGURATIONS.values.EXCLUDE_FILES) ?? [];
      return globs.every((glob) => !matchesGlob(filePath, glob));


    } else {
      const allowNotSupportedLanguages: boolean =
        getConfig(CONFIGURATIONS.values.ALLOW_NOT_SUPPORTED_LANGUAGES) ?? false;

      if (allowNotSupportedLanguages) {
        const globs: string[] =
          getConfig(CONFIGURATIONS.values.EXCLUDE_FILES) ?? [];
        return globs.every((glob) => !matchesGlob(filePath, glob));
      }
    }
  }

  return false;
};

/**
 * Checks if the given `posixPath` is not excluded by any configuration
 *
 * @param posixPath The path to check
 * @returns If the given `posixPath` should be added to the list of
 * exports
 */
export const shouldExportDirectory = (posixPath: PosixPath): boolean => {
  const globs: string[] = getConfig(CONFIGURATIONS.values.EXCLUDE_DIRS) ?? [];
  return globs.every((glob) => !matchesGlob(posixPath, glob));
};

/**
 * Returns the configuration value of the given config value
 *
 * @param name Configuration value name
 * @returns The configuration value if any
 */
export const getConfig = <T = any>(name: string): T | undefined =>
  workspace.getConfiguration().get([CONFIGURATIONS.key, name].join('.'));

export const formatDate = (date: Date = new Date()) =>
  date.toISOString().replace(/T/, ' ').replace(/\..+/, '');

/**
 * Checks if the given target path is the lib folder
 *
 * @param targetPath The barrel file target path
 * @returns If the path is the `lib` folder
 */
export const isTargetLibFolder = (targetPath: string): boolean => {
  const parts = targetPath.split('/');
  return parts[parts.length - 1] === 'lib';
};
