import { ExtensionContext } from "vscode";
import { LocalDataSource } from "../../core/data/local_data_source";
import { ANDROID_EXEC, IOS_EXEC, LOCAL_NOTIFICATION_EXAMPLE_FILE_ANDROID, LOCAL_NOTIFICATION_EXAMPLE_FILE_IOS, LOCAL_NOTIFICATION_FOLDER } from "../../core/consts/app_consts";
import { Platform } from "../../core/platform/platform";
import { Runner } from "../../core/runners/runner";
import { Dialogs } from "../../core/dialogs/dialogs";
const { exec } = require("child_process");

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
        const isInstalled = Platform.checkIfExecutableIsAvailable("emulator");

        if (!isInstalled) {
            var messageError = "Emulator not found! Please install it before running this command again.\nhttps://developer.android.com/studio/run/emulator-commandline";
            messageError += "\n\nPlease make sure it is installed and available in the PATH";
            messageError += "\nexport ANDROID_HOME=/path/to/your/android/sdk";
            messageError += "\nexport PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH";

            Dialogs.snackbar.error(messageError);
            
        }

        return isInstalled;
    }

    private async getConnectedDevicesUSB(context: ExtensionContext): Promise<string[]> {
        if (!this.isAdbInstalled(context)) throw new Error("ADB not found!");

        const runner = new Runner();
        const devices = await runner.runCommandAndReturn("adb devices | sed 1d | awk '{print $1}' | grep -v '^$'");

        // Dialogs.snackbar.info(devices);
        return devices.split("\n").filter((device: string) => device.length > 0);
    }

    async mirrorAndroidDevice(context: ExtensionContext): Promise<void> {
        if (!this.isScreenCopyInstalled(context)) return;

        // get a list of connected devices on USB
        const devices = await this.getConnectedDevicesUSB(context);

        var device;
        if (devices.length == 0) {
            Dialogs.snackbar.error("No devices connected!");
            return;
        } if (devices.length == 1) {
            device = devices[0];
        } else {
            // prompt the user to select a device
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
}