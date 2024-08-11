import { ICommand, CommandAction } from './model';

export function parseJsonString(jsonString: string) {
  if (!jsonString || !jsonString.trim()) {
    return {};
  }
  let useParams = {};
  try {
    useParams = JSON.parse(jsonString.trim());
  } catch {}
  return useParams;
}

export function jsonClone(obj: any) {
  if (!obj) {
    return obj; // null or undefined
  }
  return JSON.parse(JSON.stringify(obj));
}

export function deepFind(obj: any, path: string, defaultValue: any) {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}


export const sendCommand = (vscode: any, action: CommandAction, dataStr: string) => {
  let command: ICommand = {
    action: action,
    content: {
      name: '',
      description: dataStr
    }
  };
  if (vscode.postMessage) {
    vscode.postMessage(command);
  }
};

export function getVscodeHelper(vscode: any) {
  return {
    showMessage: (msg: string) =>
      vscode.postMessage({
        action: CommandAction.ShowMessage,
        content: {
          name: '',
          description: msg
        }
      }),
    saveList: (dataStr: string) => {
      let command: ICommand = {
        action: CommandAction.Save,
        content: {
          name: '',
          description: dataStr
        }
      };
      if (vscode.postMessage) {
        vscode.postMessage(command);
      }
    }
  };
}
