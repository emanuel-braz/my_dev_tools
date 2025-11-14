# My Dev Tools Kit 🛠️
#### Mobile & Web Development Tools Kit for VSCode and Cursor.

<img width="60" alt="mdtk" src="images/cursor-ai.png" />  

### In order to install the extension in Cursor, follow the steps below:
- [Download the VSIX file from this link](vsix/mdtk-0.0.30.vsix) [vsix/mdtk-0.0.30.vsix](https://github.com/emanuel-braz/my_dev_tools/blob/master/vsix/mdtk-0.0.30.vsix)
- Press Cmd/Ctrl + Shift + P and search for "Extensions: Install from VSIX": Type "Extensions: Install from VSIX"
- Navigate to the location where you saved the downloaded .vsix file and select it.
- or in terminal, navigate to the directory where the .vsix file is located and run the command `cursor --install-extension mdtk-0.0.30.vsix`

---

### Install from VSCode Extension Marketplace
Marketplace Web: [VSCode Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=emanuel-braz.deeplink)  

Demo App: https://github.com/emanuel-braz/mobile_dev_tools_demo

Tutorial: https://www.youtube.com/watch?v=HePUYSVf4e0

![mdtk](https://github.com/user-attachments/assets/d127cc0d-2385-4c88-9d41-71c511d16ccb)

### New feature ✨
#### Explain code and generate diagram in mermaid format (OpenAI key required)
<img width="1725" alt="Screenshot 2025-03-12 at 20 01 01" src="https://github.com/user-attachments/assets/e3975a26-980d-418f-90d8-9c5bd77e2fc6" />
  
### Features  

- Open deep link from VSCode command palette  

- Open latest deep link from quick action button  

- Deep links history  

- Send push notification to iOS simulator  

- Send push notification to Android emulator (WIP)  

- Send latest notification to simulator/emulator  

- Mirror Android device screen  

- Open iOS simulator  

- Open Android emulator  

- Connect wifi Android device  

- Disconnect wifi Android device  

- Show active devices  

- Run scripts directly from your Gist Files  

  - List all gists from a user  

  - Run a script from a gist url (Secret or Public Gist)  

  - Keep a list of all your favorite scripts on project (Secret or Public Gist)  

  - Configure your favorite gist (cache in VSCode)  

  - Run your favorite gist on terminal, copy or open it in the editor  

  - Clear cache of favorite gists  

- Task board (Kanban board, like Trello)
    - Load boards from all "*.board" files in the workspace
    - Create a new board in the workspace as default "TODO.board"
    - Configure a list of boards on user settings, separated by comma
      - ex.: `"mdt.taskBoard.fileList": "todo.board,squadX.md,personal/personal_board.board"`

- Timer ⏱️
  - Start a timer
  - Stop a timer
  - Click on the timer to stop it
  - Show the timer on the status bar

- Right click on the folder to generate barrel file
    - dart
    - typescript
    - unsupported languages configured on user settings

- Games 👾
    - Play Tic Tac Toe 🀄️
    - Play T-Rex Runner 🦖

- Messenger Call fake sounds 🔊 (It may save you from a boring meeting)

- My Notes Board: A simple board to keep your notes

### Requirements
- Android Debug Bridge (adb) for Android emulator or devices
- `scrcpy` for Android device mirroring - https://github.com/Genymobile/scrcpy

### Known Issues
- Cannot open deeplinks in specific device (it will send to default device, Android or iOS)
- Add "!" (exclamation mark) before or after the route, in order to do not filter it.

### Roadmap
- Add options to select specific device
---

### Quick action button `Deep link`
- it runs the latest deep link command  
### Quick action button `Push Notification`
- it runs the latest push notification command
### Quick action button `Fav. Gist`
- it runs your favorite gist

<img width="374" alt="image" src="https://github.com/user-attachments/assets/1338ae2e-de08-4e20-8712-12357673855e">

https://user-images.githubusercontent.com/3827308/135924984-9ab8856b-11ed-48c0-a719-770b26c0cf0a.mov
