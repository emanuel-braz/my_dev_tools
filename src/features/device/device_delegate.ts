import { ExtensionContext, QuickPickItem } from "vscode";
import { Platform } from "../../core/platform/platform";
import { Runner } from "../../core/runners/runner";
import { Dialogs } from "../../core/dialogs/dialogs";
const { exec, spawn } = require("child_process");

const fs = require('fs');
const path = require('path');

interface MirrorDeviceOptions {
    device: string;
    isAlwaysOnTop: Boolean;
    isStayAwake: Boolean;
    isTurnScreenOff: Boolean;
    isFullScreen: Boolean;
}

type IosDevice = {
    name: string;
    id: string;
    status: string;
  };

export default class DeviceDelegate {

    reconnectAndroidOfflineWifi(context: ExtensionContext): void {
        if (!this.isAdbInstalled(context)) return;

        exec(`adb reconnect offline`, (error: any, stdout: any, stderr: any) => {
            if (error) {
                Dialogs.snackbar.error(error);
            } else {
                Dialogs.snackbar.info("Reconnected offline devices");
            }
        });
    }

    disconnectAllAndroidDevices(context: ExtensionContext): void {
        if (!this.isAdbInstalled(context)) return;

        exec(`adb disconnect`, (error: any, stdout: any, stderr: any) => {
            if (error) {
                Dialogs.snackbar.error(error);
            } else {
                Dialogs.snackbar.info("Disconnected all devices");
            }
        });
        
    }

    async mirrorAndroidDevice(context: ExtensionContext): Promise<void> {

        if (!this.isScreenCopyInstalled(context)) return;

        const devices = await this.getAndroidConnectedDevicesQuickPickItem(context);
        
        var device;
        if (devices.length == 0) {
            Dialogs.snackbar.error("No devices connected!");
            return;
        } else {
            device = await Dialogs.promptAndReturn(context, devices, "Select a device to mirror");
            
            if (!device) {
                Dialogs.snackbar.info("No device selected!");
                return;
            }
        }

        try {
            const isAlwaysOnTop = await Dialogs.confirmDialog(context, "Keep always on top?", ["No", "Yes"]) === "Yes";
            const isStayAwake = await Dialogs.confirmDialog(context, "Keep device awake?", ["No", "Yes"]) === "Yes";
            const isTurnScreenOff = await Dialogs.confirmDialog(context, "Turn screen off?", ["No", "Yes"]) === "Yes";
            const isFullScreen = await Dialogs.confirmDialog(context, "Full screen?", ["No", "Yes"]) === "Yes";

            console.log(`isAlwaysOnTop: ${isAlwaysOnTop} isStayAwake: ${isStayAwake} isTurnScreenOff: ${isTurnScreenOff} isFullScreen: ${isFullScreen}`);

            Dialogs.snackbar.info(`Mirroring device ${device.label}`);
            
            this.performMirrorDevice({ device: device.label, isAlwaysOnTop, isStayAwake, isTurnScreenOff, isFullScreen });
        } catch (error) {
            Dialogs.snackbar.info("Mirror device canceled");
        }
    }

    async startAndroidDevice(context: ExtensionContext): Promise<void> {

        if (!this.isEmulatorInstalled(context)) return;

        const runner = new Runner();
        const avds = await runner.runCommandAndReturn(`$ANDROID_HOME/emulator/emulator -list-avds`);

        if (avds.length == 0) {
            Dialogs.snackbar.error("No AVDs found!");
            return;
        }

        const avd = await Dialogs.promptAndReturn(context, avds.split("\n").filter((device: string) => device.length > 0), "Select an AVD to start");

        if (!avd) {
            Dialogs.snackbar.info("No AVD selected!");
            return;
        }

        Dialogs.snackbar.info(`Starting emulator ${avd.label}`);

        try {
            const emulatorPath = path.join(process.env.ANDROID_HOME, 'emulator', 'emulator');
            const args = ['-avd', avd.label];
            this.runDetatched({ executable: emulatorPath, args });
        } catch (error) {
            Dialogs.snackbar.error("Error while starting emulator");
        }
    }
    
    async startIosDevice(context: ExtensionContext): Promise<void> {

        if (!this.isXCrunInstalled(context)) return;

        const devices = await this.getIosConnectedDevicesQuickPickItem(context);

        const device = await Dialogs.promptAndReturn(context, devices.filter((device: QuickPickItem) => device.description?.includes("Shutdown") == true), "Select a simulator to start");

        if (!device) {
            Dialogs.snackbar.info("No device selected!");
            return;
        }

        Dialogs.snackbar.info(`Starting simulator ${device.label}`);

        try {
            console.log(`xcrun simctl boot ${device.detail}`);
            exec(`xcrun simctl boot ${device.detail}`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    Dialogs.snackbar.error(error);
                } else {
                    exec(`open -a Simulator`, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            Dialogs.snackbar.error(error);
                        }
                    });
                }
            });
            
        } catch (error) {
            Dialogs.snackbar.error("Error while starting emulator");
        }
    }

    async connectAndroidWifi(context: ExtensionContext): Promise<void> {
        if (!this.isAdbInstalled(context)) return;

        const ports = [5555, 5556, 5557, 5558, 5559, 5560, 5561, 5562, 5563, 5564];

        const allDevices = (await this.getAndroidConnectedDevices(context));

        console.log(`allDevices: ${allDevices}`);

        const devicesUsb = allDevices.filter((device: string) => !device.includes(":"));
        const devicesWifi = allDevices.filter((device: string) => device.includes(":"));
        const onlyPortsAvailable = ports.filter((port: number) => !devicesWifi.includes(port.toString()));

        if (onlyPortsAvailable.length == 0) {
            Dialogs.snackbar.error("No ports available to connect via wifi! Please disconnect some devices and run this command again");
            return;
        }

        var device: QuickPickItem | undefined;
        if (devicesUsb.length == 0) {
            Dialogs.snackbar.error("No devices connected! Please connect your device via USB and run this command again");
            return;
        } else {
            device = await Dialogs.promptAndReturn(context, devicesUsb, "Select a device to connect via wifi");
            console.log(`device: ${device}`);

            if (!device) {
                Dialogs.snackbar.info("No device selected!");
                return;
            }
        }

        exec(`adb -s ${device.label} tcpip ${onlyPortsAvailable[0]}`);
        // console.log(`adb -s ${device.label} tcpip ${onlyPortsAvailable[0]}`);

        // wait 3 secs for the device to restart
        setTimeout(() => {
            exec(`adb -s ${device?.label} shell ip route | awk '{print $9}' | grep -oE '\\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b' | tail -n 1 | tr -d '\\r'`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    Dialogs.snackbar.error(error);
                } else {
                    const ip = stdout.trim();
                    console.log(`adb connect ${ip}:${onlyPortsAvailable[0]}`);
                    exec(`adb connect ${ip}:${onlyPortsAvailable[0]}`, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            Dialogs.snackbar.error(error);
                        }  else {
                            exec(`adb reconnect offline`);
                            Dialogs.snackbar.info(`Connected to device ${device?.label} via wifi on port ${onlyPortsAvailable[0]}`);
                        }
                    });
                }
            });
        }, 3000);
    }

    async disconnectAndroidWifi(context: ExtensionContext): Promise<void> {
        if (!this.isAdbInstalled(context)) return;

        const allDevices = (await this.getAndroidConnectedDevices(context)).filter((device: string) => device.includes(":"));

        var device: QuickPickItem | undefined;
        if (allDevices.length == 0) {
            Dialogs.snackbar.info("No devices connected!");
            return;
        } else {

            allDevices.unshift("All devices");

            device = await  Dialogs.promptAndReturn(context, allDevices, "Select a device to disconnect.");
            
            if (!device) {
                Dialogs.snackbar.info("No device selected!");
                return;
            }
        }

        if (device.label == "All devices") {
            this.disconnectAllAndroidDevices(context);
            return;
        } else {
            exec(`adb disconnect ${device.label}`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    Dialogs.snackbar.error(error)
                } else {
                    Dialogs.snackbar.info(`Disconnected device ${device?.label}`);
                }
            });
        }
    }

    async showConnectedDevices(context: ExtensionContext): Promise<void> {
        if (!this.isAdbInstalled(context)) return;

        const androidDevices = await this.getAndroidConnectedDevicesQuickPickItem(context);
        const iosDevices = (await this.getIosConnectedDevicesQuickPickItem(context)).filter((device: QuickPickItem) => device.description?.includes("Booted") == true);

        if (androidDevices.length === 0 && iosDevices.length === 0) {
            Dialogs.snackbar.info("No devices connected!");
            return;
        }

        Dialogs.showQuickPick(context, [ ...androidDevices, ...iosDevices ], "Connected devices");
    }
    
    private isScreenCopyInstalled(context: ExtensionContext) : Boolean {
        const isInstalled =  Platform.checkIfExecutableIsAvailable("scrcpy");

        if (!isInstalled) {
            Dialogs.snackbar.error("scrcpy not found! Please install it before running this command again\n\nhttps://github.com/Genymobile/scrcpy?tab=readme-ov-file#get-the-app");
        }

        return isInstalled;
    }

    private isAdbInstalled(context: ExtensionContext) : Boolean {
        const isInstalled = Platform.checkIfExecutableIsAvailable("adb");

        if (!isInstalled) {
            Dialogs.snackbar.error("ADB not found! Please install it before running this command again\n\nhttps://source.android.com/docs/setup/build/adb");
        }

        return isInstalled;
    }

    private isXCrunInstalled(context: ExtensionContext) : Boolean {
        const isInstalled = Platform.checkIfExecutableIsAvailable("xcrun");

        if (!isInstalled) {
            Dialogs.snackbar.error("xcrun not found! Please install it before running this command again.");
            Dialogs.snackbar.info("Run the command: xcode-select --install");
            Dialogs.snackbar.info("Run the command: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer");
            Dialogs.snackbar.info("https://developer.apple.com/download/all/?q=command%20line%20tools");
        }

        return isInstalled;
    }

    private isEmulatorInstalled(context: ExtensionContext) : Boolean {
        const isInstalled = Platform.checkIfExecutableIsAvailable("emulator", false);

        if (!isInstalled) {
            Dialogs.snackbar.error("Emulator not found! Please make sure it is installed and available in the PATH environment variable.  https://developer.android.com/studio/run/emulator-commandline");
            Dialogs.snackbar.info("export ANDROID_HOME=/path/to/your/android/sdk");
            Dialogs.snackbar.info("export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH");
        }

        return isInstalled;
    }

    private async getAndroidConnectedDevices(context: ExtensionContext): Promise<string[]> {
        if (!this.isAdbInstalled(context)) throw new Error("ADB not found!");

        try {
            const runner = new Runner();
            const devices = await runner.runCommandAndReturn("adb devices | sed 1d | awk '{print $1}' | grep -v '^$'");
            return devices.split("\n").filter((device: string) => device.length > 0);
        } catch (error) {
            return [];
        }
    }

    private async getAndroidConnectedDevicesQuickPickItem(context: ExtensionContext): Promise<QuickPickItem[]> {
        if (!this.isAdbInstalled(context)) throw new Error("ADB not found!");

        try {
            const runner = new Runner();
            const devices = await runner.runCommandAndReturn("adb devices -l");
            return this.parseAdbDevicesOutputIntoQuickPickItem(devices);
        } catch (error) {
            return [];
        }
    }

    private async getIosConnectedDevices(context: ExtensionContext): Promise<IosDevice[]> {
        if (!this.isXCrunInstalled(context)) throw new Error("xcrun not found!");

        try {
            const runner = new Runner();
            const devicesData = await runner.runCommandAndReturn(`xcrun simctl list devices | grep -v -i "unavailable" | grep -v -E "^==|^--"`);
            const devices = this.parseIosDevices(devicesData);
            return devices;
        } catch (error) {
            return [];
        }
    }

    private async getIosConnectedDevicesQuickPickItem(context: ExtensionContext): Promise<QuickPickItem[]> {
        try {
            const devices = await this.getIosConnectedDevices(context);
            return devices.map(device => ({ label: device.name, description: device.status, detail: device.id }));
        } catch (error) {
            return [];
        }
    }

    private performMirrorDevice(mirrorDeviceOptions: MirrorDeviceOptions): Promise<void> {
        
       try {
        var command = "scrcpy";
        if (mirrorDeviceOptions.isAlwaysOnTop) command += " --always-on-top";
        if (mirrorDeviceOptions.isStayAwake) command += " --stay-awake";
        if (mirrorDeviceOptions.isTurnScreenOff) command += " --turn-screen-off";
        if (mirrorDeviceOptions.isFullScreen) command += " --fullscreen";
        command += ` -s ${mirrorDeviceOptions.device}`;

        return new Promise<void>((resolve, reject) => {
            exec(command, (error: any, stdout: any, stderr: any) => {
                if (stderr) {
                    Dialogs.snackbar.error(stderr);
                    reject(stderr);
                } else if (error) {
                    Dialogs.snackbar.error(error);
                    reject(error);
                } else {
                    console.log(`${stdout}`);
                    resolve();
                }
            });
            // this.runDetatched({ executable: 'scrcpy', args: command.split(" ") });
        });
       } catch (error) {
            Dialogs.snackbar.error("Error while mirroring device");
            throw new Error("Error while mirroring device");
       }
    }

    private parseAdbDevicesOutputIntoQuickPickItem(data: string) : QuickPickItem[] {
        // Split the input string by line breaks to get each row
        const rows = data.trim().split('\n');

        // remove first item "List of devices attached"
        rows.shift();
    
        // Initialize an array to store the result
        const result: QuickPickItem[] = [];
    
        // Iterate over each row
        rows.forEach(row => {
            // Split the row by spaces to get the columns
            const columns = row.trim().split(/\s+/);
    
            // Extract the id, product, and model
            const id = columns[0];
            let product = '', model = '';
    
            // Iterate over the remaining columns to find the product and model
            columns.slice(1).forEach(column => {
                if (column.startsWith('product:')) {
                    product = column.split(':')[1];
                } else if (column.startsWith('model:')) {
                    model = column.split(':')[1];
                }
            });
    
            // Push the extracted values into the result array
            result.push({ label : id, description: product, detail: model });
        });
    
        return result;
    }

    private parseIosDevices(devicesString: string): IosDevice[] {
        // Split the input string into lines
        const lines = devicesString.trim().split('\n');
        
        // Regex to match the device details
        const deviceRegex = /^(.*?)\s+\(([^)]+)\)\s+\(([^)]+)\)$/;
      
        const devices: IosDevice[] = lines.map(line => {
          // Trim the line
          const trimmedLine = line.trim();
      
          // Match the line with the regex
          const match = trimmedLine.match(deviceRegex);
      
          if (match) {
            const [, name, id, status] = match;
            return { name, id, status };
          } else {
            throw new Error(`Line format is incorrect: ${trimmedLine}`);
          }
        });
      
        return devices;
      }

    private runDetatched({ executable, args } : { executable: string, args: string[] }) {
        
        let command;
        let options = {
            env: process.env,
            detached: true,
            stdio: 'ignore'
        };
    
        if (process.platform === 'win32') {
            // Windows-specific command
            command = 'cmd';
            args = ['/c', 'start', '""', executable, ...args];
        } else {
            // macOS and Linux
            command = 'nohup';
            args = [executable, ...args];
        }
    
        const child = spawn(command, args, options);
        child.unref();
        return child;
    }
}