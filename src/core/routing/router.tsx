import React = require("react");
import '../../features/panels/webviews/index.css';
import MainWebview from "../../features/panels/webviews/main/main_webview";
import GistView from "../../features/panels/webviews/gist/gist_webview";
import NotesWebview from "../../features/notes/webview/src/NotesWebview";

const routes: Record<string, () => JSX.Element> = {
    main: () => (
        <MainWebview />
    ),
    gist: () => (
        <GistView />
    ),
    notes: () => (
        <NotesWebview />
    ),
    default: () => (
        <h1>Route not found</h1>
    ),
};

export default routes;