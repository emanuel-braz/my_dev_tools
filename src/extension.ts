import { Dialogs } from './core/dialogs/dialogs';
import { commands, ExtensionContext, Uri, ViewColumn } from 'vscode';
import { createNotificationStatusBarItem, createDeeplinkStatusBarItem, createFavGistStatusBarItem } from './core/views/views';
import { LocalDataSource } from './core/data/local_data_source';
import { APP_LOCAL_CACHE_CLEARED } from './core/consts/strings';
import { ANDROID_DEEPLINK_EXT, IOS_DEEPLINK_EXT, LAST_PROMPT_EXT, CLEAR_CACHE_EXT, IOS_PUSH_NOTIFICATION_EXT, ANDROID_PUSH_NOTIFICATION_EXT, PUSH_NOTIFICATION_LAST_USED_EXT, ANDROID_MIRROR_SCREEN_EXT, START_ANDROID_DEVICE_EXT, CONNECT_WIFI_EXT, DISCONNECT_WIFI_EXT, SHOW_CONNECTED_DEVICES_EXT, START_IOS_DEVICE_EXT, RECONNECT_OFFLINE_WIFI_EXT, RUN_GIST_FROM_DISK_EXT, RUN_GIST_FROM_USER_EXT, RUN_GIST_URL_EXT, RUN_FAVORITE_GIST_EXT, SET_FAVORITE_GIST_EXT, CLEAR_FAVORITE_GIST_EXT, OPEN_KANBAN_BOARD } from './core/consts/extensions';
import DeeplinkDelegate from './features/deep_link/deeplink_delegate';
import PushNotificationDelegate from './features/push_notification/push_notification_delegate';
import DeviceDelegate from './features/device/device_delegate';
import { GistDelegate } from './features/gists/gist_delegate';
import KanbanBoardDelegate from './features/kanban_board/kanban_board_delegate';
import { MessengerSoundDelegate } from './features/messenger_sound/messenger_sound_delegate';
import { TimerDelegate } from './features/timer/timer_delegate';
import { ChromeDinoGaameDelegate } from './features/games/dino/dino_delegate';
import { TicTacToeDelegate } from './features/games/tictactoe/tictactoe_delegate';
import { GistPanelDelegate } from './features/main_panel/extension/panels/gist_panel_delegate';

const deeplinkDelegate = new DeeplinkDelegate();
const pushNotificationDelegate = new PushNotificationDelegate();
const deviceDelegate = new DeviceDelegate();
const gistDelegate = new GistDelegate();
const kanbanBoardDelegate = new KanbanBoardDelegate();
const messengerSoundDelegate = new MessengerSoundDelegate();
const timerDelegate = new TimerDelegate();

const gameDinoDelegate = new ChromeDinoGaameDelegate();
const tictactoeDelegate = new TicTacToeDelegate();

const gistPanelDelegate = new GistPanelDelegate();

export function activate(context: ExtensionContext) {

	// Deeplink
	createDeeplinkStatusBarItem().show();
	context.subscriptions.push(commands.registerCommand(ANDROID_DEEPLINK_EXT, async () => deeplinkDelegate.runPlatformCommand(context, true)));
	context.subscriptions.push(commands.registerCommand(IOS_DEEPLINK_EXT, async () => deeplinkDelegate.runPlatformCommand(context, false)));
	context.subscriptions.push(commands.registerCommand(LAST_PROMPT_EXT, async () => deeplinkDelegate.runPlatformCommand(context, LocalDataSource.isAndroid(context), true)));
	context.subscriptions.push(commands.registerCommand(CLEAR_CACHE_EXT, async () => {
		LocalDataSource.clear(context);
		Dialogs.snackbar.info(APP_LOCAL_CACHE_CLEARED);
	}));

	// Push Notification
	createNotificationStatusBarItem().show();
	context.subscriptions.push(commands.registerCommand(IOS_PUSH_NOTIFICATION_EXT, async () => pushNotificationDelegate.pushNotification(context, false)));
	context.subscriptions.push(commands.registerCommand(ANDROID_PUSH_NOTIFICATION_EXT, async () => pushNotificationDelegate.pushNotification(context, true)));
	context.subscriptions.push(commands.registerCommand(PUSH_NOTIFICATION_LAST_USED_EXT, async () => pushNotificationDelegate.pushNotification(context, LocalDataSource.isAndroid(context), true)));

	// Mirror Device Screen
	context.subscriptions.push(commands.registerCommand(ANDROID_MIRROR_SCREEN_EXT, async () => deviceDelegate.mirrorAndroidDevice(context)));

	// Start Device
	context.subscriptions.push(commands.registerCommand(START_ANDROID_DEVICE_EXT, async () => deviceDelegate.startAndroidDevice(context)));
	context.subscriptions.push(commands.registerCommand(START_IOS_DEVICE_EXT, async () => deviceDelegate.startIosDevice(context)));
	context.subscriptions.push(commands.registerCommand(SHOW_CONNECTED_DEVICES_EXT, async () => deviceDelegate.showConnectedDevices(context)));

	// Connect Wifi
	context.subscriptions.push(commands.registerCommand(CONNECT_WIFI_EXT, async () => deviceDelegate.connectAndroidWifi(context)));
	context.subscriptions.push(commands.registerCommand(DISCONNECT_WIFI_EXT, async () => deviceDelegate.disconnectAndroidWifi(context)));
	context.subscriptions.push(commands.registerCommand(RECONNECT_OFFLINE_WIFI_EXT, async () => deviceDelegate.reconnectAndroidOfflineWifi(context)));

	// Gits
	createFavGistStatusBarItem().show();
	context.subscriptions.push(commands.registerCommand(RUN_GIST_FROM_DISK_EXT, async () => gistDelegate.runGistFromDisk(context)));
	context.subscriptions.push(commands.registerCommand(RUN_GIST_URL_EXT, async () => gistDelegate.inputGistUrlAndRun(context)));
	context.subscriptions.push(commands.registerCommand(RUN_GIST_FROM_USER_EXT, async () => gistDelegate.runGistFromUser(context)));
	context.subscriptions.push(commands.registerCommand(RUN_FAVORITE_GIST_EXT, async () => gistDelegate.runFavoriteGist(context)));
	context.subscriptions.push(commands.registerCommand(SET_FAVORITE_GIST_EXT, async () => gistDelegate.updateFavoriteGist(context)));
	context.subscriptions.push(commands.registerCommand(CLEAR_FAVORITE_GIST_EXT, async () => gistDelegate.clearFavoriteGist(context)));

	// Kanban Board
	context.subscriptions.push(commands.registerCommand(OPEN_KANBAN_BOARD, async (uri: Uri) => kanbanBoardDelegate.openKanbanBoard(context, uri)));

	// Sounds
	messengerSoundDelegate.activate(context);

	// Timer
	timerDelegate.activate(context);

	// Games
	gameDinoDelegate.activate(context);
	tictactoeDelegate.activate(context);

	// Panels
	gistPanelDelegate.activate(context);
}


export function deactivate() { 
	timerDelegate.deactivate();
	messengerSoundDelegate.deactivate();
	// kanbanBoardDelegate.deactivate();
	// gistDelegate.deactivate();
	// deviceDelegate.deactivate();
	// pushNotificationDelegate.deactivate();
	// deeplinkDelegate.deactivate();
	gameDinoDelegate.deactivate();
	tictactoeDelegate.deactivate();
	gistPanelDelegate.deactivate();
}