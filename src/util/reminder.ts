/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2021-04-15 16:14:29
 * @LastEditors: zhai
 * @LastEditTime: 2021-04-28 15:32:46
 */



interface cbMinutesChange {
    (minutespass: number, minutes: number): void;
}

interface cbRemind {
    (): void;
}

export class Reminder {
    private _minutespass: number = 0;
    private _minutes: number = 0;
    private _idle: number = 0;
    private _enable: boolean = false;

    constructor(
        private _remind: cbRemind,
        private _cbMin: cbMinutesChange,
        MAX_IDLE: number = 5) {

        setInterval(() => {
            // 5分钟内有操作
            if (this._enable) {

                this._idle += 1;

                if (this._idle < MAX_IDLE) {
                    this._minutespass += 1;

                    if (this._minutespass >= this._minutes) {
                        this._minutespass = 0;

                        this.remind();
                    }
                }
                else {
                    this._minutespass = 0;
                }

                this.updateMinutes();
            }

        }, 1000 * 60);
    }

    set minutes(val: number) {
        this._minutes = val;
        this.updateMinutes();
    }

    set minutespass(val: number) {
        this._minutespass = val;
        this.updateMinutes();
    }

    set enable(val: boolean) {
        this._enable = val;
    }

    remindLater(minutes: number = 5) {
        this.minutespass = this._minutes - minutes;
    }

    active() {
        this._idle = 0;
    }

    async remind() {
        this._remind();
        this.minutespass = 0;
    }

    updateMinutes() {
        if (this._cbMin) {
            this._cbMin(this._minutespass, this._minutes);
        }
    }
}
