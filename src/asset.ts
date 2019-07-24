import * as vscode from 'vscode';
import { Utility } from './utility';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import {Md5} from "md5-typescript";


export default class Asset {
    public readonly TYPE_URL_IMAGE = '网络链接';
    public readonly TYPE_DEFAULT = '本地图片';

    public constructor(private context: vscode.ExtensionContext) {
    }

    public getSlideSection(): string {
        let images: vscode.Uri[] = this.getResFiles();
        const title = this.getTitle();
        let strSlide = "";

        for(var i=0; i<images.length; ++i)
        {
            let str = images[i].toString().toLowerCase();
            if(str.substring(str.length-4) == ".mp4" )
            {
                strSlide += `
                <section class="centering-wrapper">
                <p>${title}</p>
                <video class="videobox" src="${images[i]}" autoplay="autoplay" loop="loop" preload="auto">
                </section>
                `;
            }
            else
            {
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
        if(!enableLocal && !enableWeb){
            enableLocal = true;
            enableWeb = true;
        }

        let files: vscode.Uri[] = [];
        if(enableLocal){
            let tmpFiles: vscode.Uri[] = [];
            const dirPath = this.getLocalResPath();
            tmpFiles = this.readPathFiles(dirPath);
            files = files.concat(tmpFiles);
        }

        if(enableWeb){
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

    public syncFiles(){
        let urls = this.getWebResources();
        let asset = this;
        urls.forEach(function (url, index) {
            let dotIndex = url.toString().lastIndexOf('.');
            let strExt = url.substr(dotIndex);
            let strMd5 = Md5.init(url);
            let folderPath = path.join(asset.context.extensionPath, 'images/web');
            let filePath = path.join(folderPath, strMd5+strExt);
            
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if(err){
                    asset.downloadFile(url, folderPath, strMd5+strExt )
                    .then(()=>{
                        console.log('文件下载成功');
                    })
                    .catch(()=>{
                        fs.unlink(filePath, (err) => {
                            if (!err) {
                                console.log('文件已删除');
                            }
                          });
                    });
                }
                else {
                    console.log('文件已下载');
                }
            });
        });
    }
}
