/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2019-06-24 14:34:14
 * @LastEditors: zhai
 * @LastEditTime: 2021-04-28 18:26:20
 */
'use strict';

import * as vscode from 'vscode';
import { ReminderView } from './reminderView';

import Asset from './asset';
import { Reminder } from './util/reminder';
import { StatusBarItem } from 'vscode';
import { Utility } from './util/utility';
import * as path from 'path';
import * as dialog from './util/webviewDialog';

let reminder: Reminder;
let statusItemEnable: StatusBarItem;
let statusItemMinutes: StatusBarItem;

const reminderOnText = "$(pass) 燕姿在线";
const reminderOffText = "$(circle-slash) 燕姿离线";
// smiley

export function activate(context: vscode.ExtensionContext) {

    let disposables = [

        vscode.commands.registerCommand('kk.syz.remind', () => {
            ReminderView.show(context);
        }),

        vscode.commands.registerCommand('kk.syz.chat', () => {
            showChat();
        }),
        
        vscode.commands.registerCommand('kk.syz.openPhotoFolder', () => {
            let asset: Asset = new Asset(context);
            const path = asset.getLocalResPath();
            Utility.openFile(path);
        }),

        vscode.commands.registerCommand('kk.syz.switch_enable', () => {
            let config = vscode.workspace.getConfiguration("syz");
            let enable = config.get<boolean>('enable', true);

            if (enable) {
                config.update('enable', false);
                statusItemEnable.text = reminderOffText;
                statusItemMinutes.hide();
                vscode.window.showInformationMessage('syz reminder off');

                reminder.enable = false;
            }
            else {
                config.update('enable', true);
                statusItemEnable.text = reminderOnText;
                statusItemMinutes.show();
                vscode.window.showInformationMessage('syz reminder on');

                reminder.enable = true;
                reminder.minutespass = 0;
            }
        }),

        vscode.commands.registerCommand('kk.syz.set_minutes', () => {
            let config = vscode.workspace.getConfiguration("syz");

            let items: vscode.QuickPickItem[] = [
                { label: "1", description: "每[1]分钟提醒一次" },
                { label: "30", description: "每[30]分钟提醒一次" },
                { label: "45", description: "每[45]分钟提醒一次" },
                { label: "60", description: "每[60]分钟提醒一次" },
                { label: "90", description: "每[90]分钟提醒一次" },
                { label: "120", description: "每[120]分钟提醒一次" }
            ];

            vscode.window.showQuickPick(items).then(selection => {
                if (selection) {
                    statusItemMinutes.text = formatMinutesText(0, selection.label);
                    config.update('reminderIntervalInMinutes', parseInt(selection.label));

                    reminder.minutes = parseInt(selection.label);
                    reminder.minutespass = 0;
                }
            });
        })
    ];

    context.subscriptions.push(...disposables);

    try {
        let asset: Asset = new Asset(context);
        // vscode.window.showInformationMessage("sync start...");
        asset.syncFiles();
    } catch (error) {
        // vscode.window.showErrorMessage("sync error...");
    }

    initReminder();
}


function formatMinutesText(minutespass: number, minutes: number | string) {
    return `$(clock) [${minutespass}/${minutes}]分钟`;
}

function initReminder() {

    statusItemEnable = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1100);
    statusItemEnable.command = 'kk.syz.switch_enable';
    statusItemEnable.show();

    statusItemMinutes = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1099);
    statusItemMinutes.command = 'kk.syz.set_minutes';

    let config = vscode.workspace.getConfiguration("syz");
    let enable = config.get<boolean>('enable', true);
    statusItemEnable.text = enable ? reminderOnText : reminderOffText;

    let minutes = config.get<number>('reminderIntervalInMinutes', 45);
    statusItemMinutes.text = formatMinutesText(0, minutes);

    if (enable) {
        statusItemMinutes.show();
    }

    reminder = new Reminder(
        async () => {
            await vscode.commands.executeCommand('kk.syz.remind');
        },
        (minutespass: number, minutes: number) => {
            statusItemMinutes.text = formatMinutesText(minutespass, minutes);
        }
    );

    reminder.minutes = minutes;
    reminder.enable = enable;
}


interface TestDialogResult {
    name: string;
}

async function showChat(): Promise<void> {
    const testDir = path.resolve(__dirname, '../kedou');

    const d = new dialog.WebviewDialog<TestDialogResult>('webview-kedou', testDir, 'index.html');

    const result: TestDialogResult | null = await d.getResult();

    if (result) {
        vscode.window.showInformationMessage("Webview dialog result: " + JSON.stringify(result));
    } else {
        vscode.window.showInformationMessage("The webview dialog was cancelled.");
    }
}

export function deactivate() {
}