var WebSocketService = function (scene, webSocket) {
    var webSocketService = this;

    var webSocket = webSocket;
    var scene = scene;

    this.hasConnection = false;

    this.welcomeHandler = function (data) {
        webSocketService.hasConnection = true;

        scene.initUserID(data.id);

        webSocketService.sendConfig();
        webSocketService.sendUpdate();

        $('#chat').initChat();

    };

    this.updateHandler = function (data) {
        var newtp = false;

        if (!scene.tadpoles[data.id]) {
            newtp = true;
            scene.tadpoles[data.id] = new Tadpole();
        }

        var tadpole = scene.tadpoles[data.id];
        if (data.name) {
            tadpole.name = data.name;
        }

        if (data.gender) {
            tadpole.gender = data.gender;
        }

        if (tadpole.id == scene.userTadpole.id) {
            return;
        }

        if (newtp) {
            tadpole.x = data.x;
            tadpole.y = data.y;

            // 更新列表
            vmLog.updateUsers(scene.tadpoles);
            vmLog.addLog({
                type: "connect",
                user: tadpole,
            });
        } else {
            tadpole.targetX = data.x;
            tadpole.targetY = data.y;
        }

        tadpole.terminal = data.terminal;
        tadpole.weiboID = data.weiboID;

        tadpole.angle = data.angle;
        tadpole.momentum = data.momentum;

        tadpole.timeSinceLastServerUpdate = 0;
    }

    this.messageHandler = function (data) {
        var tadpole = scene.tadpoles[data.id];
        if (!tadpole) {
            return;
        }
        tadpole.timeSinceLastServerUpdate = 0;
        tadpole.messages.push(new Message(data.message));

        // 消息日志
        vmLog.addLog({
            user: tadpole,
            message: {
                content: data.message,
                time: new Date(),
                x: parseInt(tadpole.x),
                y: parseInt(tadpole.y),
            },
            type: "message",
        });
    }

    this.closedHandler = function (data) {
        if (scene.tadpoles[data.id]) {
            vmLog.addLog({
                type: "disconnect",
                message: scene.tadpoles[data.id].name + "离开了池塘",
            });

            delete scene.tadpoles[data.id];
            vmLog.updateUsers(scene.tadpoles);
        }
    }

    this.processMessage = function (data) {
        var fn = webSocketService[data.type + 'Handler'];
        if (fn) {
            fn(data);
        }
    }

    this.connectionClosed = function () {
        webSocketService.hasConnection = false;
        $('#cant-connect').fadeIn(300);
    };

    this.sendUpdate = function () {
        var sendObj = {
            type: 'update',
            x: +scene.userTadpole.x.toFixed(1),
            y: +scene.userTadpole.y.toFixed(1),
            angle: +scene.userTadpole.angle.toFixed(3),
            momentum: +scene.userTadpole.momentum.toFixed(3),
            name: scene.userTadpole.name,
            gender: scene.userTadpole.gender,
            terminal: scene.userTadpole.terminal,
            weiboID: scene.userTadpole.weiboID
        };

        webSocket.send(JSON.stringify(sendObj));
    }

    // send config
    this.sendConfig = function () {
        if (!this.hasConnection)
            return;

        var sendObj = {
            type: 'config',
            id: scene.userTadpole.id,
            name: scene.userTadpole.name,
            gender: scene.userTadpole.gender,
            terminal: scene.userTadpole.terminal,
            weiboID: scene.userTadpole.weiboID
        };

        webSocket.send(JSON.stringify(sendObj));
    }


    this.sendMessage = function (msg) {
        //"name:jet"
        var regexp = /name: ?(.+)/i;
        if (regexp.test(msg)) {
            //暂时保留这个命令
            scene.userTadpole.name = msg.match(regexp)[1];
            webSocketService.sendConfig();
            return;
        }

        //"gendr:1"
        var regexp = /gender: ?([0-9])/i;
        if (regexp.test(msg)) {
            //暂时保留这个命令
            var gender = Number(msg.match(regexp)[1]);
            if (gender < 0 || gender > 2) {
                gender = 0;
            }

            scene.userTadpole.gender = gender;
            webSocketService.sendConfig();
            return;
        }

        var sendObj = {
            type: 'message',
            message: msg,
            x: +scene.userTadpole.x.toFixed(1),
            y: +scene.userTadpole.y.toFixed(1)
        };

        webSocket.send(JSON.stringify(sendObj));
    }

    this.authorize = function (token, verifier) {
        var sendObj = {
            type: 'authorize',
            token: token,
            verifier: verifier
        };

        webSocket.send(JSON.stringify(sendObj));
    }
}