# 燕姿鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有孙燕姿提醒你该休息啦~

## 使用

除了每过一小时会自动弹出提醒页面，也可以按 `F1`, 然后输入 `syz: 打开提醒页面`来打开提醒页面

![usage](images/usage.jpg)

## 配置

* `syz.reminderViewIntervalInMinutes`: 展示提醒页面的时间间隔（分钟）。(默认值为**60**)
* `syz.title`: 提示文字。 (默认值为**小哥哥，小哥哥，代码写久了，该休息啦~**)
* `syz.resLocal`: true (启动本地图片/视频)；false (停用本地图片/视频)。(默认值为**true**)
* `syz.resWeb`: true (启动网络图片/视频)；false (停用网络图片/视频)。(默认值为**true**)
* `syz.webResources`: 配置网络资源链接数组

```
如下例子，启用网络图片/视频，支持[jpg/png/mp4]格式：
"syz.resWeb": true,
"syz.webResources": [
    "https://github.com/kanbang/links/raw/master/pic/1.jpg",
    "https://github.com/kanbang/links/raw/master/pic/2.jpg",
    "https://github.com/kanbang/links/raw/master/video/Stefanie%20Sun/shenqi.mp4",
    "https://github.com/kanbang/links/raw/master/video/Stefanie%20Sun/banjuzaijian.mp4"
]
```
## 如何更改本地图片/视频

* vscode不允许读取外部文件路径，所以只能自己去替换插件内的媒体。替换步骤如下：
  
  1. 按 `F1`, 然后输入 `syzfolder: 打开媒体文件夹，添加自己喜欢的照片/视频` 来打开媒体文件夹

  2. 替换文件夹内的图片/视频
