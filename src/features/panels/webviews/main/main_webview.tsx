import React = require("react");
import { Action, AppHelper } from "../../../../core/helpers/app_helper";
import { Gist, GistFile } from "../../../gists/gist_types";

const styles = {
  container: {
    display: 'flex',
    gap: '10px',
  },
  icon: {
    flex: 1,
    marginBottom: '10px'
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginBottom: '10px'
  },
  svgIcon: {
    cursor: 'pointer',
  },
};

export default function MainWebview() {

  const [gist, setGist] = React.useState<Gist>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const onMessage = (event: any) => {
    const message = event.data;

    console.log('Received message:', event.data);

    if (message.action === Action.refreshMainPanel) {
      const gist: Gist = message.payload;
      setIsLoading(false);
      setGist(gist);
    } else if (message.action === Action.fechingFavoriteGist) {
      const isFeching: boolean = message.payload.isLoading;
      setIsLoading(isFeching);
    }
  }

  React.useEffect(() => {
    window.addEventListener("message", onMessage);

    fetchData();

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  function fetchData() {
    AppHelper.instance.postMessage({ action: Action.refreshMainPanel });
  }

  async function runGistFile(file: GistFile, inCurrentTerminal: boolean): Promise<void> {
    AppHelper.instance.postMessage({
      action: Action.runGist,
      payload: {
        file: file,
        inCurrentTerminal: inCurrentTerminal
      }
    });
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2>Favorite Gist Files</h2>
      {isLoading ? <div>Loading...</div>
        : <div>
          {
            gist && gist.files ? (
              <div>
                {Object.keys(gist.files).map((fileName) => (
                  <div key={fileName} style={styles.container}>
                    <button key={fileName} style={styles.text} onClick={() => runGistFile(gist.files[fileName], true)}>{fileName}</button>
                    <svg onClick={() => runGistFile(gist.files[fileName], false)} style={styles.svgIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zM5 5v14h14v-7h2v7c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h7v2H5z" />
                    </svg>
                  </div>
                ))}
              </div>
            ) : null
          }
        </div>}

    </div>
  );
}
