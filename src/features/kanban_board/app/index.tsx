import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import { IConfig } from './model';
// import Config from "./config";

import MainView from './components/CodeGen/MainView';
import TaskBoard from './components/TaskBoard/TaskBoard';

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: IConfig;
  }
}
//@ts-ignore 
const vscode = window.acquireVsCodeApi();

//@ts-ignore 
if (window.initialData.name === 'TaskBoard') {
  ReactDOM.render(
    //@ts-ignore 
    <TaskBoard vscode={vscode} initialData={window.initialData} />,
    //@ts-ignore 
    document.getElementById('root')
  );
} else {
  ReactDOM.render(
    //@ts-ignore 
    <MainView vscode={vscode} initialData={window.initialData} />,
    //@ts-ignore 
    document.getElementById('root')
  );
}
