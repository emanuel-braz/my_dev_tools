import { ExtensionContext } from "vscode";

export interface Feature {
    activate(context: ExtensionContext): void;
    deactivate(): void;
}