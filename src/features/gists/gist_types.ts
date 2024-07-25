import { QuickInputButton, QuickPickItem, ThemeIcon, Uri } from "vscode";

export class ButtonCallback implements QuickInputButton {
    iconPath: ThemeIcon | Uri | { light: Uri; dark: Uri; };
    callback: () => void;

    constructor(iconPath: ThemeIcon | Uri | { light: Uri; dark: Uri; }, callback: () => void) {
        this.iconPath = iconPath;
        this.callback = callback;
    }
}

export interface GistFile extends QuickPickItem {
    filename: string;
    type: string;
    language: string | null;
    raw_url: string;
    size: number;
    buttons: ButtonCallback[];
}

export interface Gist extends QuickPickItem {
    id: string;
    description: string;
    html_url: string;
    files: { [key: string]: GistFile };
    public: boolean;
    created_at: string;
    updated_at: string;
}

export type SecretGistFile = {
    name: string;
    url: string;
}