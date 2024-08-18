import React = require("react");
import './index.css';
import GistView from "./gist_view";

const routes: Record<string, () => JSX.Element> = {
    gist: () => (
        <GistView />
    ),
    default: () => (
        <h1>Route not found</h1>
    ),
};

export default routes;