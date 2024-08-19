import React = require("react");
import '../../features/panels/webviews/index.css';
import MainWebview from "../../features/panels/webviews/main/main_webview";
import GistView from "../../features/panels/webviews/gist/gist_webview";

const routes: Record<string, () => JSX.Element> = {
    main: () => (
        <MainWebview />
    ),
    gist: () => (
        <GistView />
    ),
    default: () => (
        <h1>Route not found</h1>
    ),
};

export default routes;