import { StatusBarItem, window, StatusBarAlignment, ThemeColor } from 'vscode';
import * as path from 'path';

export default class Timer {
    private _statusBarItem: StatusBarItem;
    private _timer: ReturnType<typeof setInterval> | null = null;
    private _isSpecificTime: boolean = false;
    private _endTime: Date | null = null;

    constructor() {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
        this._statusBarItem.command = 'extension.cancelTimer';
        this._statusBarItem.text = '00:00';
    }

    public start(time: number, alarmMessage: string = '', isSpecificTime: boolean = false) {
        this._isSpecificTime = isSpecificTime;
        this._endTime = new Date(new Date().getTime() + time * 60000);

        const initialTimeDisplay = this.formatTimerDisplay(
            this._isSpecificTime,
            time,
            this._endTime
        );

        this._statusBarItem.text = initialTimeDisplay;
        this._statusBarItem.tooltip = this.createTooltip(alarmMessage, this._endTime);
        this._statusBarItem.backgroundColor = new ThemeColor('statusBarItem.warningBackground');
        this._statusBarItem.show();

        this._timer = setInterval(() => {
            const t = this.getTimeRemaining(this._endTime);

            const timeDisplay = this.formatTimerDisplay(
                this._isSpecificTime,
                t.minutes,
                this._endTime,
                t.seconds
            );

            this._statusBarItem.text = timeDisplay;
            this._statusBarItem.tooltip = this.createTooltip(alarmMessage, this._endTime);

            if (t.minutes <= 0 && t.seconds <= 60) {
                this._statusBarItem.backgroundColor = new ThemeColor('statusBarItem.errorBackground');
            } else {
                this._statusBarItem.backgroundColor = new ThemeColor('statusBarItem.warningBackground');
            }

            if (t.total <= 0) {
                if (this._timer) {
                    clearInterval(this._timer);
                }
                this._statusBarItem.hide();
                window.showInformationMessage(alarmMessage || '⏱️ Timer finished!');

                const player = require("play-sound")();
                let soundPath = path.join(__dirname, `../../../resources/sounds/beep.wav`);
                player.play(soundPath);
            }
        }, 1000);
    }

    public stop() {
        if (this._timer) {
            clearInterval(this._timer);
        }
        if (this._statusBarItem) {
            this._statusBarItem.hide();
        }
        this._isSpecificTime = false;
        this._endTime = null;
        this._timer = null;
    }

    private getTimeRemaining(endTime: Date | null) {
        if (!endTime) {
            return { total: 0, minutes: 0, seconds: 0 };
        }
        let t = endTime.getTime() - new Date().getTime();
        let seconds = Math.floor((t / 1000) % 60);
        let minutes = Math.floor((t / 1000 / 60) % 60);
        return {
            total: t,
            minutes: minutes,
            seconds: seconds
        };
    }

    private _zeroBase(value: number): string {
        return value < 10 ? `0${value}` : value.toString();
    }

    private formatEndTime(endTime: Date | null): string {
        if (!endTime) return '00:00';
        return `${this._zeroBase(endTime.getHours())}:${this._zeroBase(endTime.getMinutes())}`;
    }

    private formatTimerDisplay(isSpecificTime: boolean, minutes: number, endTime: Date | null, seconds?: number): string {
        if (isSpecificTime && endTime) {
            const timeStr = this.formatEndTime(endTime);
            const countdown = seconds !== undefined ?
                `${this._zeroBase(minutes)}:${this._zeroBase(seconds)}` :
                `${minutes}:00`;
            return `${countdown} (🕐 ${timeStr})`;
        } else {
            return seconds !== undefined ?
                `${this._zeroBase(minutes)}:${this._zeroBase(seconds)}` :
                `${minutes}:00`;
        }
    }

    private createTooltip(message: string, endTime: Date | null): string {
        let tooltip = '';

        if (endTime) {
            const timeStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            tooltip += `Ends at ${timeStr}\n`;
        }

        tooltip += message || 'No message';

        return tooltip;
    }
}
