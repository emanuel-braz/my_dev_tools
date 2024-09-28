import { OpenDialogOptions } from 'vscode';

export const CONFIGURATIONS = {
  key: 'mdt.barrelFileGenerator',
  values: {
    APPEND_FOLDER: 'appendFolderName',
    APPEND_LIB_PACKAGE: 'prependPackageToLibExport',
    DEFAULT_NAME: 'defaultBarrelName',
    EXCLUDE_DIRS: 'excludeDirList',
    EXCLUDE_FILES: 'excludeFileList',
    EXCLUDE_FREEZED: 'excludeFreezed',
    EXCLUDE_TYPESCRIPT_DECLARATION: 'excludeTypescriptDeclaration',
    INCLUDE_TSX_FILES: 'includeTsxFiles',
    EXCLUDE_GENERATED: 'excludeGenerated',
    PREPEND_FOLDER: 'prependFolderName',
    PROMPT_NAME: 'promptName',
    SKIP_EMPTY: 'skipEmpty',
    ALLOW_NOT_SUPPORTED_LANGUAGES: 'allowNotSupportedLanguages',
  },
  input: {
    canSelectMany: false,
    canSelectFiles: false,
    canSelectFolders: true,
    openLabel: 'Select the folder in which you want to create the barrel file'
  } as Partial<OpenDialogOptions>
};

export const DART_FILE_REGEX = {
  /**
   * Used to check whether the current file name has a
   * dart file extension
   */
  dart: new RegExp('.+(\\.dart)$'),

  /**
   * Used to check whether the current filename has a
   * dart file extension suffixed with the given value
   */
  suffixed: (suffix: string) => new RegExp(`.+(\\.${suffix}\\.dart)$`),

  /**
   * Returns a regex that will match if the filename has
   * the same name as the barrel file of the `folder` param
   *
   * @param {string} folder The folder name
   * @returns {RegExp}
   */
  base: (folder: string): RegExp => new RegExp(`^${folder}\\.dart$`)
};

export const TYPESCRIPT_FILE_REGEX = {
  /**
   * Used to check whether the current file name has a
   * typescript file extension
   */
  typescript: new RegExp('.+(\\.ts)$'),

  /**
   * Used to check whether the current filename has a
   * typescript file extension suffixed with the given value
   */
  suffixed: (suffix: string) => new RegExp(`.+(\\.${suffix}\\.ts)$`),

  /**
   * Returns a regex that will match if the filename has
   * the same name as the barrel file of the `folder` param
   *
   * @param {string} folder The folder name
   * @returns {RegExp}
   */
  base: (folder: string): RegExp => new RegExp(`^${folder}\\.ts$`)
};

export const TYPESCRIPT_JSX_FILE_REGEX = {
  /**
   * Used to check whether the current file name has a
   * typescript JSX file extension
   */
  typescriptJsx: new RegExp('.+(\\.tsx)$'),

  /**
   * Used to check whether the current filename has a
   * typescript file extension suffixed with the given value
   */
  suffixed: (suffix: string) => new RegExp(`.+(\\.${suffix}\\.tsx)$`),

  /**
   * Returns a regex that will match if the filename has
   * the same name as the barrel file of the `folder` param
   *
   * @param {string} folder The folder name
   * @returns {RegExp}
   */
  base: (folder: string): RegExp => new RegExp(`^${folder}\\.tsx$`)
};
