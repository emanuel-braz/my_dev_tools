import { ExtensionContext } from 'vscode';
import { IS_ANDROID_KEY, LINKS_KEY, MAX_ITENS } from '../consts/app_consts';

export class LocalDataSource {

    static updateLink(context: ExtensionContext, link?: string): void {

        if (link) {
            let links = LocalDataSource.getLinks(context);
            links.unshift(link);
            const maxItems = Math.min(links.length, MAX_ITENS);
            links = links.slice(0, maxItems);
            context.globalState.update(LINKS_KEY, links);
        }
    }

    static updateLastLink(context: ExtensionContext, from: number): void {
        if (from == -1) return;
        const to = 0;
        let links = LocalDataSource.getLinks(context);
        links.splice(to, 0, links.splice(from, 1)[0]);
        context.globalState.update(LINKS_KEY, links);
    }

    static getLinks(context: ExtensionContext): string[] {
        return context.globalState.get(LINKS_KEY, []);
    }

    static clear(context: ExtensionContext) {
        return context.globalState.update(LINKS_KEY, []);
    }

    static updateIsAndroid(context: ExtensionContext, isAndroid: Boolean): void {
        context.globalState.update(IS_ANDROID_KEY, isAndroid);
    }

    static isAndroid(context: ExtensionContext): Boolean {
        return context.globalState.get(IS_ANDROID_KEY, true);
    }
}