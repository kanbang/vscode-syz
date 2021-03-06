<!--
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2019-11-04 09:28:37
 * @LastEditors: zhai
 * @LastEditTime: 2021-05-26 17:45:41
-->
# 燕姿鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有孙燕姿提醒你该休息啦~

## 使用

1. 除了每过一小时会自动弹出提醒页面，也可以按 `F1`, 然后输入 `syz: 打开提醒页面`来打开提醒页面
2. 在提醒页可以使用方向键/鼠标滚轮，循环、循环、再循环……翻来覆去看不同照片
3. 在花好约猿︱媛页面可以偶遇其他媛或者猿，一起吐槽下产品也不错~
4. 在状态栏可以打开/关闭提醒，以及设置提醒间隔时间
5. 如果五分钟没有操作vscode，那就认为已经在休息了。这时候会停止计时，只有下一次鼠标/键盘活动时才会重新计时
6. 欢迎来github拍砖


![img](https://cdn.jsdelivr.net/gh/kanbang/resource@main/pic/vsyanzi.gif)


## 配置

* `syz.reminderViewIntervalInMinutes`: 展示提醒页面的时间间隔（分钟）。(默认值为**60**)
* `syz.title`: 提示文字。 (默认值为**小哥哥，小哥哥，代码写久了，喝杯水吧~**)
* `syz.kedou`: true (启用蝌蚪聊聊)；false (停用蝌蚪聊聊)。(默认值为**true**)
* `syz.resLocal`: true (启用本地图片/视频)；false (停用本地图片/视频)。(默认值为**true**)
* `syz.resWeb`: true (启用网络图片/视频)；false (停用网络图片/视频)。(默认值为**true**)
* `syz.webResources`: 配置网络资源链接数组
* `syz.gender`: 设置性别 "男", "女", "保密" (默认值为**保密**)

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
