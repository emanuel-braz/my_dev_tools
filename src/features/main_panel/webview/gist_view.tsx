import React = require("react");
import { Command, Action, AppHelper } from "./app_helper";

export default function GistView() {

  const [gistList, setGistList] = React.useState([]);

  const onMessage = (event: { data: Command }) => {
    setGistList([
      { id: 1, title: 'oi', description: 'abcdef' },
      { id: 2, title: 'oi2', description: 'abcdef2' },
    ]);
  }

  React.useEffect(() => {
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  function fetchData() {
    fetch('https://gist.github.com/emanuel-braz/9adf6e767b2439ffbc60ce7bb0f459ad')
      .then(response => response.json())
      .then(data => {
        setGistList(data);
        showSuccessMessage();
      })
      .catch(error => {
        showErrorMessage();
      });

  }

  function showSuccessMessage(): void {
    const command: Command = {
      action: Action.showMessage,
      payload: {
        "message": "Gists loaded successfully",
        "type": "info"
      }
    };
    AppHelper.instance.postMessage(command);
  }

  function showErrorMessage(): void {
    const command: Command = {
      action: Action.showMessage,
      payload: {
        "message": "Failed to load gists",
        "type": "error"
      }
    };
    AppHelper.instance.postMessage(command);
  }

  return (
    <div>
      <h1>Favorite Gists</h1>
      <button onClick={fetchData}>
        Refresh Data
      </button>

      <div>
        {gistList.map((gist: any) => (
          <div key={gist.id}>
            <h2>{gist.title}</h2>
            <p>{gist.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}