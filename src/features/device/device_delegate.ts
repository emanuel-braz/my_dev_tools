import { ExtensionContext, QuickPickItem } from "vscode";
import { LocalDataSource } from "../../core/data/local_data_source";
import { ANDROID_EXEC, IOS_EXEC, LOCAL_NOTIFICATION_EXAMPLE_FILE_ANDROID, LOCAL_NOTIFICATION_EXAMPLE_FILE_IOS, LOCAL_NOTIFICATION_FOLDER } from "../../core/consts/app_consts";
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

export default class DeviceDelegate {
    
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

    private isEmulatorInstalled(context: ExtensionContext) : Boolean {
        const isInstalled = Platform.checkIfExecutableIsAvailable("emulator", false);

        if (!isInstalled) {
            var messageError = "Emulator not found! Please install it before running this command again.\nhttps://developer.android.com/studio/run/emulator-commandline";
            messageError += "\n\nPlease make sure it is installed and available in the PATH environment variable";
            messageError += "\n\nexport ANDROID_HOME=/path/to/your/android/sdk";
            messageError += "\n\nexport PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH";

            Dialogs.snackbar.error(messageError);
            
        }

        return isInstalled;
    }

    private async getConnectedDevicesUSB(context: ExtensionContext): Promise<string[]> {
        return (await this.getConnectedDevices(context)).filter((device: string) => !device.includes(":"));
    }

    private async getConnectedDevices(context: ExtensionContext): Promise<string[]> {
        if (!this.isAdbInstalled(context)) throw new Error("ADB not found!");

        try {
            const runner = new Runner();
            const devices = await runner.runCommandAndReturn("adb devices | sed 1d | awk '{print $1}' | grep -v '^$'");
            return devices.split("\n").filter((device: string) => device.length > 0);
        } catch (error) {
            return [];
        }
    }

    private async getConnectedDevicesQuickPickItem(context: ExtensionContext): Promise<QuickPickItem[]> {
        if (!this.isAdbInstalled(context)) throw new Error("ADB not found!");

        try {
            const runner = new Runner();
            const devices = await runner.runCommandAndReturn("adb devices -l");
            return  this.parseAdbDevicesOutputIntoQuickPickItem(devices);
        } catch (error) {
            return [];
        }
    }

    async mirrorAndroidDevice(context: ExtensionContext): Promise<void> {

        if (!this.isScreenCopyInstalled(context)) return;

        const devices = await this.getConnectedDevicesQuickPickItem(context);
        
        var device;
        if (devices.length == 0) {
            Dialogs.snackbar.error("No devices connected!");
            return;
        } if (devices.length == 1) {
            device = devices[0].label;
        } else {
            device = await Dialogs.promptAndReturn(context, devices, "Select a device to mirror");
            
            if (!device) {
                Dialogs.snackbar.error("No device selected!");
                return;
            }
        }

        try {
            const isAlwaysOnTop = await Dialogs.confirmDialog(context, "Keep always on top?", ["No", "Yes"]) === "Yes";
            const isStayAwake = await Dialogs.confirmDialog(context, "Keep device awake?", ["No", "Yes"]) === "Yes";
            const isTurnScreenOff = await Dialogs.confirmDialog(context, "Turn screen off?", ["No", "Yes"]) === "Yes";
            const isFullScreen = await Dialogs.confirmDialog(context, "Full screen?", ["No", "Yes"]) === "Yes";

            console.log(`isAlwaysOnTop: ${isAlwaysOnTop} isStayAwake: ${isStayAwake} isTurnScreenOff: ${isTurnScreenOff} isFullScreen: ${isFullScreen}`);

            Dialogs.snackbar.info(`Mirroring device ${device}`);
            
            this.performMirrorDevice({ device, isAlwaysOnTop, isStayAwake, isTurnScreenOff, isFullScreen });
        } catch (error) {
            Dialogs.snackbar.error("Mirror device canceled");
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
        });
       } catch (error) {
            Dialogs.snackbar.error("Error while mirroring device");
            throw new Error("Error while mirroring device");
       }
    }

    async startAvd(context: ExtensionContext): Promise<void> {

        if (!this.isEmulatorInstalled(context)) return;

        const runner = new Runner();
        const avds = await runner.runCommandAndReturn(`$ANDROID_HOME/emulator/emulator -list-avds`);

        if (avds.length == 0) {
            Dialogs.snackbar.error("No AVDs found!");
            return;
        }

        const avd = await Dialogs.promptAndReturn(context, avds.split("\n").filter((device: string) => device.length > 0), "Select an AVD to start");

        if (!avd) {
            Dialogs.snackbar.error("No AVD selected!");
            return;
        }

        Dialogs.snackbar.info(`Starting emulator ${avd}`);

        try {
            exec(`$ANDROID_HOME/emulator/emulator -avd ${avd}`);
        } catch (error) {
            Dialogs.snackbar.error("Error while starting emulator");
        }
    }

    async connectAndroidWifi(context: ExtensionContext): Promise<void> {
        if (!this.isAdbInstalled(context)) return;

        const ports = [5555, 5556, 5557, 5558, 5559, 5560, 5561, 5562, 5563, 5564];

        const allDevices = (await this.getConnectedDevices(context));

        console.log(`allDevices: ${allDevices}`);

        const devicesUsb = allDevices.filter((device: string) => !device.includes(":"));
        const devicesWifi = allDevices.filter((device: string) => device.includes(":"));
        const onlyPortsAvailable = ports.filter((port: number) => !devicesWifi.includes(port.toString()));

        if (onlyPortsAvailable.length == 0) {
            Dialogs.snackbar.error("No ports available to connect via wifi! Please disconnect some devices and run this command again");
            return;
        }

        var device: string | undefined;
        if (devicesUsb.length == 0) {
            Dialogs.snackbar.error("No devices connected! Please connect your device via USB and run this command again");
            return;
        } if (devicesUsb.length == 1) {
            device = devicesUsb[0];
        } else {
            device = await Dialogs.promptAndReturn(context, devicesUsb, "Select a device to connect via wifi");
            console.log(`device: ${device}`);

            if (!device) {
                Dialogs.snackbar.error("No device selected!");
                return;
            }
        }

        spawn(`adb -s ${device} tcpip ${onlyPortsAvailable[0]}`);
        console.log(`adb -s ${device} tcpip ${onlyPortsAvailable[0]}`);

        // wait 2 secs for the device to restart
        setTimeout(() => {
            exec(`adb -s ${device} shell ip route | awk '{print $9}' | grep -oE '\\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b' | tail -n 1 | tr -d '\\r'`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    Dialogs.snackbar.error(error);
                } else {
                    const ip = stdout.trim();
                    console.log(`adb connect ${ip}:${onlyPortsAvailable[0]}`);
                    exec(`adb connect ${ip}:${onlyPortsAvailable[0]}`, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            Dialogs.snackbar.error(error);
                        } else if (stdout.includes("fail")) {
                            Dialogs.snackbar.error(stdout);
                        } else {
                            exec(`adb reconnect offline`);
                            Dialogs.snackbar.info(`Connected to device ${device} via wifi on port ${onlyPortsAvailable[0]}`);
                        }
                    });
                    
                }
            });
        }, 2000);
    }

    async disconnectAndroidWifi(context: ExtensionContext): Promise<void> {
        if (!this.isAdbInstalled(context)) return;

        const allDevices = (await this.getConnectedDevices(context)).filter((device: string) => device.includes(":"));

        var device: string | undefined;
        if (allDevices.length == 0) {
            Dialogs.snackbar.info("No devices connected!");
            return;
        } else {

            allDevices.unshift("All devices");

            device = await  Dialogs.promptAndReturn(context, allDevices, "Select a device to disconnect.");
            
            if (!device) {
                Dialogs.snackbar.error("No device selected!");
                return;
            }
        }

        if (device == "All devices") {
            this.disconnectAllAndroidDevices(context);
            return;
        } else {
            exec(`adb disconnect ${device}`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    Dialogs.snackbar.error(error)
                } else {
                    Dialogs.snackbar.info(`Disconnected device ${device}`);
                }
            });
        }
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

    async showConnectedDevices(context: ExtensionContext): Promise<void> {
        if (!this.isAdbInstalled(context)) return;

        const devices = await this.getConnectedDevicesQuickPickItem(context);

        Dialogs.showQuickPick(context, devices, "Connected devices");
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
}