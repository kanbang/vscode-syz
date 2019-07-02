'use strict';
import * as vscode from 'vscode';
import Asset from './asset';
import * as child_process from "child_process";

export class ReminderView {
    private static panel: vscode.WebviewPanel | undefined;

    protected static openFile(filePath: string) {
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

    public static openFolder(context: vscode.ExtensionContext, ) {
        let asset: Asset = new Asset(context);
        const path = asset.getDefaultsyzImagePath();

        ReminderView.openFile(path);
    }

    public static show(context: vscode.ExtensionContext, ) {
        let asset: Asset = new Asset(context);

        const strSlideSection = asset.getSlideSection();
        const title = asset.getTitle();

        if (this.panel) {
            this.panel.webview.html = this.generateHtml(strSlideSection, title);
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel("syz", "孙燕姿", vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            

            this.panel.webview.html = this.generateHtml(strSlideSection, title);
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
    }

    protected static generateHtml(strSlideSection: vscode.Uri|string, title: string): string {
        let html = `<!doctype html>
        <html lang="en">
        <meta charset="utf-8">
        <title>YOUR TITLE HERE</title>
        <base target="_blank">
        <!--link rel="icon" type="image/png" href="data:image/png;base64,YOUR-FAVICON-HERE"-->
        <style>body,html{overflow:hidden;font-size:4vw;width:100%;height:100%;margin:0;padding:0}body.loaded{transition:.3s}body.loaded section{transition:opacity .5s}section{position:fixed;top:1vw;bottom:1vw;left:1vw;right:1vw;opacity:0}section:target{z-index:1}body:not(.muted) section:target{opacity:1}img{max-height:100%;max-width:100%}.incremental:not(.revealed){visibility:hidden}</style>
        <style>
            /* Your custom styles */
            section {
                /*background: transparent right bottom / 15vw auto no-repeat url("YOUR-LOGO.png");*/
            }
            p {  line-height:1; font-size:18px; margin-top:8px; color:lightgray; font-family: 'Microsoft YaHei','SF Pro Display',Arial,'PingFang SC',sans-serif }
        </style>
        
        ${strSlideSection}
        
        <script>var slides,currentPageNumber,activeSlide,incremental,keyCodeNormalized,setPage,processHash,document_body,revealedCls="revealed",incrementalSelector=".incremental",querySelector="querySelector",loc=location,doc=document;document_body=doc.body,slides=Array.from(doc[querySelector+"All"]("section")),setPage=function(e){currentPageNumber=Math.min(slides.length,e||1),activeSlide=slides[currentPageNumber-1],slides.map.call(activeSlide[querySelector+"All"](incrementalSelector),function(e){e.classList.remove(revealedCls)}),loc.hash=currentPageNumber,document_body.style.background=activeSlide.dataset.bg||"",document_body.dataset.slideId=activeSlide.dataset.id||currentPageNumber},addEventListener("keydown",function(e,r){keyCodeNormalized=e.which-32,keyCodeNormalized&&keyCodeNormalized-2&&keyCodeNormalized-7&&keyCodeNormalized-8||(incremental=activeSlide[querySelector](incrementalSelector+":not(."+revealedCls+")"),incremental?incremental.classList.add(revealedCls):currentPageNumber>=slides.length?setPage(1):setPage(currentPageNumber+1),r=1),keyCodeNormalized-1&&keyCodeNormalized-5&&keyCodeNormalized-6||(setPage(currentPageNumber<=1?slides.length:currentPageNumber-1),r=1),keyCodeNormalized+5||(document_body.classList.toggle("muted"),r=1),keyCodeNormalized-4||(setPage(1),r=1),keyCodeNormalized-3||(setPage(1/0),r=1),r&&e.preventDefault()}),slides.map(function(e,r){e.id=r+1}),setInterval(processHash=function(e){e=loc.hash.substr(1),e!=currentPageNumber&&setPage(e)},99),processHash(),document_body.classList.add("loaded");</script>
        <script>location.hash=Math.ceil(Math.random()*slides.length)</script>`;

        return html;
    }
}