import { Feature } from "../../infra/feature/feature";
import { window, commands, ExtensionContext } from 'vscode';
import Timer from './timer';

export class TimerDelegate implements Feature {
    private timer: Timer = new Timer();
    private isSpecificTimeTimer: boolean = false;

    activate(context: ExtensionContext) {
        let startTimer = commands.registerCommand('extension.startTimer', () => {
            window
                .showQuickPick(['Set timer duration in minutes', 'Set timer to specific time'], {
                    placeHolder: 'Choose timer type'
                })
                .then(timerType => {
                    this.isSpecificTimeTimer = timerType === 'Set timer to specific time';
                    if (timerType === 'Set timer duration in minutes') {
                        this.startMinutesTimer();
                    } else if (timerType === 'Set timer to specific time') {
                        this.startSpecificTimeTimer();
                    }
                });
        });

        let stopTimer = commands.registerCommand('extension.stopTimer', () => {
            this.timer.stop();
        });

        let cancelTimer = commands.registerCommand('extension.cancelTimer', () => {
            window.showInformationMessage("Would you like to cancel the timer?", "Yes", "No").then((selection) => {
                if (selection === "Yes") {
                    this.timer.stop();
                }
            });
        });

        context.subscriptions.push(startTimer);
        context.subscriptions.push(stopTimer);
        context.subscriptions.push(cancelTimer);
    }

    private startMinutesTimer() {
        window
            .showInputBox({
                prompt: 'How many minutes?',
                placeHolder: 'Enter time in minutes (e.g. 30)',
                validateInput: this.validateMinutesInput
            })
            .then(value => {
                if (value) {
                    this.promptMessageAndStartTimer(parseInt(value));
                }
            });
    }

    private startSpecificTimeTimer() {
        window
            .showInputBox({
                prompt: 'What time?',
                placeHolder: 'Enter the time (e.g. 14:30)',
                validateInput: this.validateTimeInput
            })
            .then(value => {
                if (value) {
                    const minutes = this.calculateMinutesFromTime(value);
                    if (minutes > 0) {
                        this.promptMessageAndStartTimer(minutes);
                    } else {
                        window.showErrorMessage('The specified time has already passed. Please choose a future time.');
                    }
                }
            });
    }

    private promptMessageAndStartTimer(minutes: number) {
        window
            .showInputBox({
                prompt: 'Enter a message to show when the timer ends (Optional)',
                placeHolder: 'Timer finished!',
            })
            .then(msg => {
                if (msg !== undefined) this.timer.start(minutes, msg, this.isSpecificTimeTimer);
            });
    }

    private validateMinutesInput(value: string): string | null {
        const numericValue = parseInt(value);
        if (isNaN(numericValue)) {
            return 'The value must be a valid number';
        } else if (numericValue <= 0) {
            return 'The value must be greater than zero';
        }
        return null;
    }

    private validateTimeInput(value: string): string | null {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
            return 'The format must be HH:MM (e.g. 14:30)';
        }
        return null;
    }

    private calculateMinutesFromTime(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const targetTime = new Date();
        targetTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const diffMs = targetTime.getTime() - now.getTime();

        const diffMinutes = Math.ceil(diffMs / (1000 * 60));

        return diffMinutes;
    }

    deactivate() {
        //
    }
}
