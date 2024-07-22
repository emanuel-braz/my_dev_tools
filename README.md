![image](https://user-images.githubusercontent.com/3827308/135861079-6f39a13a-393d-4fb6-a487-76652636cd0e.png)

# Mobile Dev Tools 🛠️

## Deep link, Push Notification, Screen Mirroring, WIFI debugging/connection, Virtual Device Management - VSCode Extension (Android / iOS)

### Install from VSCode Extension Marketplace
Marketplace Web: [VSCode Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=emanuel-braz.deeplink)  

<img width="1067" alt="image" src="https://github.com/emanuel-braz/deeplink/assets/3827308/fda3fa9e-f4a7-4cef-99dd-0af37ab47643">
  
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

### Requirements
- Android Debug Bridge (adb) for Android emulator or devices
- `scrcpy` for Android device mirroring - https://github.com/Genymobile/scrcpy

### Known Issues
- Cannot open deeplinks in specific device (it will send to default device, Android or iOS)
- Add "!" (exclamation mark) before or after the route, in order to do not filter it.

### Roadmap
- Add options to select specific device
- App settings interface

---

### Quick action button `Deep link`
- it runs the latest deep link command  
### Quick action button `Push Notification`
- it runs the latest push notification command

![image](https://github.com/emanuel-braz/deeplink/assets/3827308/4ba5979f-f164-428f-9ac1-5a2fa7b92f2f)


https://user-images.githubusercontent.com/3827308/135924984-9ab8856b-11ed-48c0-a719-770b26c0cf0a.mov
