import { Runner } from './core/runners/runner';
import { Dialogs } from './core/dialogs/dialogs';
import { commands, ExtensionContext } from 'vscode';
import { createStatusBarItem } from './core/views/views';
import { Platform } from './core/platform/platform';
import { LocalDataSource } from './core/data/local_data_source';
import { APP_DEEPLINK_ANDROID, APP_DEEPLINK_IOS, APP_LOCAL_CACHE_CLEARED } from './core/consts/strings';
import { ANDROID_EXEC, IOS_EXEC } from './core/consts/app_consts';
import { ANDROID_DEEPLINK_EXT, IOS_DEEPLINK_EXT, LAST_PROMPT_EXT, CLEAR_CACHE_EXT } from './core/consts/extensions';

export function deactivate() {}

export function activate(context: ExtensionContext) {
	createStatusBarItem().show();
	context.subscriptions.push(commands.registerCommand(ANDROID_DEEPLINK_EXT, async () => runPlatformCommand(context, true)));
	context.subscriptions.push(commands.registerCommand(IOS_DEEPLINK_EXT, async () => runPlatformCommand(context, false)));
	context.subscriptions.push(commands.registerCommand(LAST_PROMPT_EXT, async () => runPlatformCommand(context, LocalDataSource.isAndroid(context), true)));
	context.subscriptions.push(commands.registerCommand(CLEAR_CACHE_EXT, async () => {
		LocalDataSource.clear(context);
		Dialogs.snackbar.info(APP_LOCAL_CACHE_CLEARED);
	}));
}

async function runPlatformCommand(context: ExtensionContext, isAndroid: Boolean, isLastPrompt: Boolean = false) {
	LocalDataSource.updateIsAndroid(context, isAndroid);
	if (!Platform.checkIfExecutableIsAvailable(isAndroid ? ANDROID_EXEC : IOS_EXEC)) return;
	const suggestions = LocalDataSource.getLinks(context);

	if (isLastPrompt == true && suggestions.length > 0) {
		runCommand(suggestions[0], isAndroid);
	} else {
		let route = await Dialogs.getRoute(context, isAndroid, suggestions);
		runCommand(route, isAndroid);
	}
}

function runCommand(route: string, isAndroid: Boolean) {
	if (route.length > 0){
		if (isAndroid) {
			console.log(`${APP_DEEPLINK_ANDROID} ${route}`);
			Runner.runAndroid(route);
		} else {
			console.log(`${APP_DEEPLINK_IOS} ${route}`);
			Runner.runIos(route);
		}
	}
}