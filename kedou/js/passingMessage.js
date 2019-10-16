// Handle the message inside the webview
window.addEventListener('message', event => {

    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
        case 'gender0':
            app.setGender(0);
            break;
        case 'gender1':
            app.setGender(1);
            break;
        case 'gender2':
            app.setGender(2);
            break;
    }
});