
# Mobile Dev Tools 🛠️

## Deep link, Push Notification, Screen Mirroring, WIFI connection, Virtual Device Management, Gist, etc.

### Install from VSCode Extension Marketplace
Marketplace Web: [VSCode Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=emanuel-braz.deeplink)  

<img width="1337" alt="image" src="https://github.com/user-attachments/assets/b89151d4-dcaa-4b50-b951-38793c693f4a">
  
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
