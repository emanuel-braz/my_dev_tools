import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { LAST_PROMPT_EXT, PUSH_NOTIFICATION_LAST_USED_EXT } from '../consts/extensions';
import { APP_STATUS_BAR_ITEM, APP_STATUS_BAR_ITEM_HINT, APP_STATUS_BAR_PUSH_NOTIFICATION, APP_STATUS_BAR_PUSH_NOTIFICATION_HINT } from '../consts/strings';

export function createDeeplinkStatusBarItem(): StatusBarItem {
    let actionButton = window.createStatusBarItem(StatusBarAlignment.Left, 0);
    actionButton.command = LAST_PROMPT_EXT;
    actionButton.text = APP_STATUS_BAR_ITEM;
    actionButton.tooltip = APP_STATUS_BAR_ITEM_HINT;
    return actionButton;
}

export function createNotificationStatusBarItem(): StatusBarItem {
    let actionButton = window.createStatusBarItem(StatusBarAlignment.Left, 0);
    actionButton.command = PUSH_NOTIFICATION_LAST_USED_EXT;
    actionButton.text = APP_STATUS_BAR_PUSH_NOTIFICATION;
    actionButton.tooltip = APP_STATUS_BAR_PUSH_NOTIFICATION_HINT;
    return actionButton;
}