# My Dev Tools 🛠️

## Open Deep link, Push Notification, Screen Mirroring, WIFI connection, Virtual Device Management, Run Gists on Terminal, Kanban Board, Timer, Games, Sounds, etc.

### Install from VSCode Extension Marketplace
Marketplace Web: [VSCode Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=emanuel-braz.deeplink)  

Demo App: https://github.com/emanuel-braz/mobile_dev_tools_demo

Tutorial: https://www.youtube.com/watch?v=HePUYSVf4e0

![mdtk](https://github.com/user-attachments/assets/d127cc0d-2385-4c88-9d41-71c511d16ccb)

<a href="https://www.buymeacoffee.com/emanuelbraz" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 217px !important;" ></a>
  
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
