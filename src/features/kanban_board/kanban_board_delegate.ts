import { ExtensionContext, QuickPickItem, Uri } from "vscode";
import TaskBoardLoader from "./TaskBoardLoader";

const { exec, spawn } = require("child_process");

const fs = require('fs');
const path = require('path');

export default class KanbanBoardDelegate {
    openKanbanBoard(context: ExtensionContext, uri: Uri): TaskBoardLoader {
        const kanbanBoard = new TaskBoardLoader(context.extensionPath, uri);
        return kanbanBoard;
    }
}