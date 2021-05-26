/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2019-06-24 14:34:14
 * @LastEditors: zhai
 * @LastEditTime: 2021-05-26 16:35:12
 */
'use strict';

import * as vscode from 'vscode';

import Asset from './asset';
import { Reminder } from './util/reminder';
import { StatusBarItem } from 'vscode';
import { Utility } from './util/utility';
import * as path from 'path';
import * as dialog from './util/webviewDialog';
import * as fs from 'fs';

let reminder: Reminder;
let statusItemEnable: StatusBarItem;
let statusItemMinutes: StatusBarItem;
let asset: Asset;


const reminderOnText = "$(pass) 燕姿在线";
const reminderOffText = "$(circle-slash) 燕姿离线";
// smiley

export function activate(context: vscode.ExtensionContext) {
    asset = new Asset(context);

    let disposables = [

        vscode.commands.registerCommand('kk.syz.remind', () => {
            showStefanie(context);
        }),

        vscode.commands.registerCommand('kk.syz.chat', () => {
            showChat(context);
        }),

        vscode.commands.registerCommand('kk.syz.openPhotoFolder', () => {
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
            let config = vscode.workspace.getConfiguration("syz");
            let kedou = config.get<boolean>('kedou', true);
            if (kedou) {
                await vscode.commands.executeCommand('kk.syz.chat');
            }

            await vscode.commands.executeCommand('kk.syz.remind');
        },
        (minutespass: number, minutes: number) => {
            statusItemMinutes.text = formatMinutesText(minutespass, minutes);
        }
    );

    reminder.minutes = minutes;
    reminder.enable = enable;

    vscode.workspace.onDidChangeTextDocument((ev) => {
		// console.log(ev);
		if (reminder) {
			reminder.active();
		}
	});

	vscode.window.onDidChangeTextEditorSelection((ev) => {
		// console.log(ev);
		if (reminder) {
			reminder.active();
		}
	});

	vscode.window.onDidChangeTextEditorVisibleRanges((ev) => {
		// console.log(ev);
		if (reminder) {
			reminder.active();
		}
	});
}


interface DialogResult {
    name: string;
}

var dlg_chat: dialog.WebviewDialog<DialogResult> | null = null;
var dlg_stefanie: dialog.WebviewDialog<DialogResult> | null = null;

async function showChat(context: vscode.ExtensionContext): Promise<void> {
    if (dlg_chat) {
        return;
    }

    // const rootDir = path.resolve(__dirname, '../kedou');
    const extPath = context.extensionPath;
    const rootDir = path.join(extPath, 'kedou');

    dlg_chat = new dialog.WebviewDialog<DialogResult>('webview-kedou', rootDir, '', 'index.html', vscode.ViewColumn.Beside,
        (message) => {
            switch (message.command) {
                case 'setting':
                    asset.setGender(message.gender);
                    asset.setNickname(message.nickname);
                    break;
                default:
                    break;
            }
        });

    dlg_chat.postMessage({
        command: 'setting',
        gender: asset.getGender(),
        nickname: asset.getNickname()
    });

    const result = await dlg_chat.getResult();
    dlg_chat = null;

    if (result) {
        // vscode.window.showInformationMessage("Webview dialog result: " + JSON.stringify(result));
    } else {
        // vscode.window.showInformationMessage("The webview dialog was cancelled.");
    }
}

async function showStefanie(context: vscode.ExtensionContext): Promise<void> {
    if (dlg_stefanie) {
        return;
    }

    const title = asset.getTitle();

    const extPath = context.extensionPath;
    const rootDir = path.join(extPath, 'reminder');
    const resourcePath = path.join(rootDir, 'index.html');
    // const rootDir = path.dirname(resourcePath);

    const strSlideSection = asset.getSlideSection(rootDir);

    let html = fs.readFileSync(resourcePath, 'utf-8');
    html = html.replace("<!-- ${strSlideSection} -->", strSlideSection);

    var hello = JSON.stringify(title);
    html = html.replace("<!-- ${hello} -->", hello);

    // const testDir = path.resolve(__dirname, '../reminder');

    dlg_stefanie = new dialog.WebviewDialog<DialogResult>('webview-kedou', rootDir, html, '');

    const result = await dlg_stefanie.getResult();
    dlg_stefanie = null;

    if (result) {
        // vscode.window.showInformationMessage("Webview dialog result: " + JSON.stringify(result));
    } else {
        // vscode.window.showInformationMessage("The webview dialog was cancelled.");
    }
}

export function deactivate() {
}