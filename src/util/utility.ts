/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2019-06-24 14:34:14
 * @LastEditors: zhai
 * @LastEditTime: 2021-04-28 16:18:28
 */
"use strict";
import * as child_process from "child_process";

export class Utility {
    public static openFile(filePath: string) {
        if (process.platform === "win32") {
            if (filePath.match(/^[a-zA-Z]:\\/)) {
                // C:\ like url.
                filePath = "file:///" + filePath;
            }

            if (filePath.startsWith("file:///")) {
                return child_process.execFile("explorer.exe", [filePath]);
            } else {
                return child_process.exec(`start ${filePath}`);
            }
        } else if (process.platform === "darwin") {
            child_process.execFile("open", [filePath]);
        } else {
            child_process.execFile("xdg-open", [filePath]);
        }
    }

}