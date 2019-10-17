import * as vscode from 'vscode';
import { Utility } from './utility';
import * as path from 'path';
import * as fs from 'fs';

import axios from 'axios';
// import * as WebRequest from "web-request";

import { Md5 } from "md5-typescript";


export default class Asset {
    public readonly TYPE_URL_IMAGE = '网络链接';
    public readonly TYPE_DEFAULT = '本地图片';

    public constructor(private context: vscode.ExtensionContext) {
    }

    public getSlideSection(): string {
        let images: vscode.Uri[] = this.getResFiles();
        const title = this.getTitle();
        let strSlide = "";

        for (var i = 0; i < images.length; ++i) {
            let str = images[i].toString().toLowerCase();
            if (str.substring(str.length - 4) === ".mp4") {
                strSlide += `
                <section class="centering-wrapper">
                <p>${title}</p>
                <video class="videobox" src="${images[i]}" autoplay="autoplay" loop="loop" preload="auto">
                </section>
                `;
            }
            else {
                strSlide += `
                <section class="centering-wrapper">
                <p>${title}</p>
                <div class="imgbox" style="background-image: url(${images[i]})"></div>
                </section>
                `;
            }
        }

        return strSlide;
    }

    protected getResFiles(): vscode.Uri[] {
        let enableLocal = this.enableLocalRes();
        let enableWeb = this.enableWebRes();
        if (!enableLocal && !enableWeb) {
            enableLocal = true;
            enableWeb = true;
        }

        let files: vscode.Uri[] = [];
        if (enableLocal) {
            let tmpFiles: vscode.Uri[] = [];
            const dirPath = this.getLocalResPath();
            tmpFiles = this.readPathFiles(dirPath);
            files = files.concat(tmpFiles);
        }

        if (enableWeb) {
            let tmpFiles: vscode.Uri[] = [];
            const dirPath = this.getWebResPath();
            tmpFiles = this.readPathFiles(dirPath);
            files = files.concat(tmpFiles);
        }

        return files;
    }

    protected readPathFiles(dirPath: string): vscode.Uri[] {
        let files: vscode.Uri[] = [];
        const result = fs.readdirSync(dirPath);
        result.forEach(function (item, index) {
            const stat = fs.lstatSync(path.join(dirPath, item));
            if (stat.isFile()) {
                files.push(vscode.Uri.file(path.join(dirPath, item)).with({ scheme: 'vscode-resource' }));
            }
        });
        return files;
    }

    public getLocalResPath() {
        return path.join(this.context.extensionPath, 'images/syz');
    }

    public getWebResPath() {
        return path.join(this.context.extensionPath, 'images/web');
    }

    public getWebTmpPath() {
        return path.join(this.context.extensionPath, 'images/tmp');
    }

    public getKedouPath() {
        return path.join(this.context.extensionPath, 'kedou');
    }


    protected enableLocalRes(): boolean {
        return Utility.getConfiguration().get<boolean>('resLocal', true);
    }

    protected enableWebRes(): boolean {
        return Utility.getConfiguration().get<boolean>('resWeb', true);
    }

    protected getWebResources() {
        return Utility.getConfiguration().get<string[]>('webResources', []);
    }

    public getTitle(): string {
        return Utility.getConfiguration().get<string>('title', '');
    }

    public getNickname(): string {
        return Utility.getConfiguration().get<string>('nickname', '');
    }

    public getGender(): number {
        switch (Utility.getConfiguration().get<string>('gender', '')) {
            case "男":
                return 1;
            case "女":
                return 2;
            default:
                return 0;
        }
    }

    public setNickname(name: string) {
        Utility.getConfiguration().update('nickname', name);
    }

    public setGender(gender: number) {
        switch (gender) {
            case 1:
                Utility.getConfiguration().update('gender', "男");
                break;
            case 2:
                Utility.getConfiguration().update('gender', "女");
                break;
            default:
                Utility.getConfiguration().update('gender', "保密");
                break;
        }
    }



    ////////////////////////////////////////////////////////////////////////////
    /**
     * 从某个HTML文件读取能被Webview加载的HTML内容
     * @param {*} context 上下文
     * @param {*} templatePath 相对于插件根目录的html文件相对路径
     */
    public getWebViewContent(context: vscode.ExtensionContext, templatePath: string): string {
        const resourcePath = path.join(context.extensionPath, templatePath);
        const dirPath = path.dirname(resourcePath);
        let html = fs.readFileSync(resourcePath, 'utf-8');
        //vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
        html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
            return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
        });
        return html;
    }

    public getKedouLink(context: vscode.ExtensionContext): string {
        let folderPath = this.getKedouPath();
        let indexPath0 = path.join(folderPath, 'index0.html');

        fs.access(indexPath0, fs.constants.F_OK, (err) => {
            if (err) {
                let html = this.getWebViewContent(context, 'kedou/index.html');
                var fd = fs.openSync(indexPath0, 'w');
                fs.writeSync(fd, html);
                fs.closeSync(fd);
            }
        });

        return vscode.Uri.file(indexPath0).with({ scheme: 'vscode-resource' }).toString();
    }

    ////////////////////////////////////////////////////////////////////////////

    protected async downloadFile(url: string, filepath: string, name: string) {
        if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath);
        }

        const mypath = path.resolve(filepath, name);
        const writer = fs.createWriteStream(mypath);
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
    }

    /*
    protected async downloadFile(url: string, filepath: string, name: string) {
        let request = WebRequest.stream(url);

        const mypath = path.resolve(filepath, name);
        let writePath = fs.createWriteStream(mypath);

        request.pipe(writePath);
        await request.response;
        await new Promise(resolve => writePath.on('finish', () => resolve()));
    };
    */

    public syncFiles() {
        let urls = this.getWebResources();
        let asset = this;

        let folderPath = this.getWebResPath();
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        let webFiles: vscode.Uri[] = [];
        const dirPath = this.getWebResPath();
        webFiles = this.readPathFiles(dirPath);

        let urlFiles: string[] = [];

        urls.forEach((url, index) => {
            let dotIndex = url.toString().lastIndexOf('.');
            let strExt = url.substr(dotIndex);
            let strMd5 = Md5.init(url);
            let filePath = path.join(folderPath, strMd5 + strExt);

            urlFiles.push(filePath);

            let folderPathTmp = asset.getWebTmpPath();
            let filePathTmp = path.join(folderPathTmp, strMd5 + strExt);

            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    fs.unlink(filePathTmp, (err) => { console.log(err); });

                    asset.downloadFile(url, folderPathTmp, strMd5 + strExt)
                        .then(() => {
                            //拷贝
                            fs.rename(filePathTmp, filePath, (err) => {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log('文件[' + strMd5 + strExt + ']同步完成');
                                }
                            });

                            // fs.unlink(filePathTmp, (err) => { console.log(err); });
                        });
                }
                else {
                    console.log('文件[' + strMd5 + strExt + ']已存在');
                }
            });
        });

        webFiles.forEach((item) => {
            if (urlFiles.findIndex((urlItem) => {
                return item.fsPath === urlItem;
            }) < 0) {
                console.log('删除文件[' + item.fsPath + ']');
                fs.unlink(item.fsPath, (err) => { console.log(err); });
            }
        });
    }

}
