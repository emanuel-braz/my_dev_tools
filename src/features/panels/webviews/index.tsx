import React = require("react");
import './index.css';
import ReactDOM from "react-dom/client";
import { AppHelper as AppHelper } from "../../../core/helpers/app_helper";
import routes from "../../../core/routing/router";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    route: string;
    payload: any;
  }
}

const vscode = window.acquireVsCodeApi();
new AppHelper(vscode, window.route, window.payload)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const initialRoute = window.route || "default";

const renderRoute = routes[initialRoute] || routes.default;
root.render(<React.StrictMode>{renderRoute()}</React.StrictMode>);
