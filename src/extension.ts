'use strict';
import * as vscode from 'vscode';
import { ReminderView } from './reminderView';
import { Scheduler } from './scheduler';
import Asset from './asset';


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('syz.showReminderView', () => {
        ReminderView.show(context);
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('syz.openPhotoFolder', () => {
        ReminderView.openFolder(context);
    }));
    
    const scheduler = new Scheduler(context);
    scheduler.start();

    let asset: Asset = new Asset(context);
    asset.syncFiles();
}

export function deactivate() {
}