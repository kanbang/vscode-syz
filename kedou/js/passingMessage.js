// Handle the message inside the webview
window.addEventListener('message', event => {

    const message = event.data; // The JSON data our extension sent
    alert(message.command);

    switch (message.command) {
        case 'setting':
            app.setGender(message.gender);
            app.setName(message.nickname);
            break;
        default:
            break;
    }
});


//不能重复执行acquireVsCodeApi
const vscode = acquireVsCodeApi();

function postSetting2Extension(gender, name) {
    vscode.postMessage({
        command: 'setting',
        gender: gender,
        nickname: name
    });
}