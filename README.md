# 燕姿鼓励师

在 VS Code 中连续写代码一小时（时间可配置），会有孙燕姿提醒你该休息啦~

## 使用

除了每过一小时会自动弹出提醒页面，也可以按 `F1`, 然后输入 `syz: 打开提醒页面`来打开提醒页面

![usage](images/usage.png)

## 配置

* `syz.reminderViewIntervalInMinutes`: 展示提醒页面的时间间隔（分钟）。(默认值为**60**)
* `syz.title`: 提示文字。 (默认值为**小哥哥，小哥哥，代码写久了，该休息啦~**)
* `syz.type`: default (默认图)；url (图片地址)。(默认值为**default**)
* `syz.customImages`: 配置图片数组（需要搭配syz.type为url） (默认值为**默认图片**)

```
如下例子，使用自定义图片：
"syz.type": "url",
"syz.customImages": [
    "http://b-ssl.duitang.com/uploads/item/201806/04/20180604090459_gqqjo.jpg"
]
```
## 如何使用本地图片作为展示图片

* vscode不允许读取外部文件路径，所以只能自己去替换插件内的图片。替换步骤如下：
  
  1、找到vscode插件安装的地方 (如mac 在~/.vscode/extensions/formulahendry.syz-{version})
  
  2、替换images/syz内图片
