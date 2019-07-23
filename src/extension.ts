'use strict';
import * as vscode from 'vscode';
import { ReminderView } from './reminderView';
import { Scheduler } from './scheduler';
import axios from 'axios';
import * as path from 'path';

function saveFile(path: string, data: string) {
    fs.writeFile(path, data, (err: NodeJS.ErrnoException) => {
        console.log(err);
    });
}

export function activate(context: vscode.ExtensionContext) {


    axios.get('https://github.com/kanbang/links/raw/master/video/Stefanie%20Sun/shenqi.mp4'

            ).then(reponse => {
                let data = reponse.data;
                
                let dir = path.join(context.extensionPath, 'images/syz');
            
                saveFile(dir + '/shenqi.mp4', data);


            }).catch(error => {
                console.log(error);
            })



    const scheduler = new Scheduler(context);
    scheduler.start();

    context.subscriptions.push(vscode.commands.registerCommand('syz.showReminderView', () => {
        ReminderView.show(context);
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('syz.openPhotoFolder', () => {
        ReminderView.openFolder(context);
    }));
}

export function deactivate() {
}