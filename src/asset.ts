import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Utility } from './utility';

export default class Asset {
    public readonly TYPE_URL_IMAGE = '网络链接';
    public readonly TYPE_DEFAULT = '本地图片';

    public constructor(private context: vscode.ExtensionContext) {
    }

    public getSlideSection(): string {
        const type: string = this.getConfigType();
        
        let images: vscode.Uri[] | string[];

        if (type === this.TYPE_URL_IMAGE) {
            images = this.getCustomImages();
        } else {
            images = this.getDefaultImages();
        }

        // user forget setting customImages, get default images
        if (images.length === 0) {
            images = this.getDefaultImages();
        }

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

    protected getDefaultImages(): vscode.Uri[] {
        const dirPath = this.getDefaultsyzImagePath();
        const files = this.readPathImage(dirPath);
        return files;
    }

    protected readPathImage(dirPath: string): vscode.Uri[] {
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

    public getDefaultsyzImagePath() {
        return path.join(this.context.extensionPath, 'images/syz');
    }

    protected getConfigType(): string {
        return Utility.getConfiguration().get<string>('type', 'default');
    }

    protected getCustomImages() {
        return Utility.getConfiguration().get<string[]>('customImages', []);
    }

    public getTitle(): string {
        return Utility.getConfiguration().get<string>('title', '');
    }
}
