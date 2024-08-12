import { Feature } from './../../core/feature/feature';

import { window, commands, ExtensionContext } from 'vscode';
import Timer from './timer';

export class TimerDelegate implements Feature {

    timer: Timer;

    activate(context: ExtensionContext) {
        this.timer = new Timer();

        let startTimer = commands.registerCommand('extension.startTimer', () => {
            window
                .showInputBox({
                    prompt: 'How long?',
                    placeHolder: 'Enter time in minutes',
                    validateInput: this.validateTimerInput
                })
                .then(value => {
                    if (value) {
                        window
                            .showInputBox({
                                prompt: 'Enter a message to show when timer ends (Optional)',
                                placeHolder: 'Timer is up!',
                            })
                            .then(msg => {
                                if (msg !== undefined) this.timer.start(parseInt(value), msg);
                            });
                    }
                });
        });

        let stopTimer = commands.registerCommand('extension.stopTimer', () => {
            this.timer.stop();
        });

        context.subscriptions.push(startTimer);
        context.subscriptions.push(stopTimer);
    }

    validateTimerInput(value: string) {
        let numericValue = parseInt(value);
        if (isNaN(numericValue)) {
            return 'Minutes has to be in the form of a valid number';
        } else {
            return null;
        }
    }

    deactivate() {
        //
    }
}
