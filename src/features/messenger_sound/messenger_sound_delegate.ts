import * as vscode from 'vscode';
import * as path from 'path';
import { Feature } from '../../infra/feature/feature';

export class MessengerSoundDelegate implements Feature {
    private player: any;
    currentProcess: any;

    constructor() {
        this.player = require("play-sound")();
    }

    activate(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('extension.showSoundPicker', () => {
            this.showSoundPicker();
        });

        context.subscriptions.push(disposable);
    }

    async showSoundPicker() {
        const sounds = [
            { label: "MS Teams Call", description: "Play", filePath: path.join(__dirname, '../../../resources/sounds', 'ms_teams.mp3') },
            { label: "Slack Message", description: "Play", filePath: path.join(__dirname, '../../../resources/sounds', 'slack_message.mp3') }
        ];

        const quickPick = vscode.window.createQuickPick();
        quickPick.title = 'Select a sound';
        quickPick.ignoreFocusOut = true;
        quickPick.items = sounds.map(sound => ({
            label: sound.label,
            buttons: [
                { iconPath: new vscode.ThemeIcon('play'), tooltip: 'Play' },
                { iconPath: new vscode.ThemeIcon('debug-stop'), tooltip: 'Stop' }
            ]
        }));

        quickPick.onDidTriggerItemButton(async e => {
            const sound = sounds.find(s => s.label === e.item.label);
            if (sound) {
                if (e.button.tooltip === 'Play') {
                    this.playSound(sound.filePath);
                } else if (e.button.tooltip === 'Stop') {
                    this.stopSound();
                }
            }
        });

        quickPick.onDidChangeSelection(e => {
            const sound = sounds.find(s => s.label === e[0].label);
            if (sound) {
                if (this.currentProcess) {
                    this.stopSound();
                } else {
                    this.playSound(sound.filePath);
                }
            }
        });

        quickPick.onDidHide(() => {
            this.stopSound();
            quickPick.dispose();
        });

        quickPick.show();
    }



    playSound(filePath: string) {
        if (this.currentProcess) {
            this.stopSound();
        }

        this.currentProcess = this.player.play(filePath, (err: any) => {
            if (err) console.error(err);
        });
    }

    stopSound() {
        if (this.currentProcess) {
            this.currentProcess.kill();
            this.currentProcess = null;
        }
    }

    deactivate() {
        //
    }

}