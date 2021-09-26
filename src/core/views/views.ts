import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { LAST_PROMPT_EXT } from '../consts/extensions';
import { APP_STATUS_BAR_ITEM, APP_STATUS_BAR_ITEM_HINT } from '../consts/strings';

export function createStatusBarItem(): StatusBarItem {
    let actionButton = window.createStatusBarItem(StatusBarAlignment.Left, 98);
    actionButton.command = LAST_PROMPT_EXT;
    actionButton.text = APP_STATUS_BAR_ITEM;
    actionButton.tooltip = APP_STATUS_BAR_ITEM_HINT;
    return actionButton;
}