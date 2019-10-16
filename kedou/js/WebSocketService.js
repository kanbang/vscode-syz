var WebSocketService = function(scene, webSocket) {
    var webSocketService = this;

    var webSocket = webSocket;
    var scene = scene;

    this.hasConnection = false;

    this.welcomeHandler = function(data) {
        webSocketService.hasConnection = true;

        scene.initUserID(data.id);

        webSocketService.sendConfig();

        $('#chat').initChat();

    };

    this.updateHandler = function(data) {
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

    this.messageHandler = function(data) {
        var tadpole = scene.tadpoles[data.id];
        if (!tadpole) {
            return;
        }
        tadpole.timeSinceLastServerUpdate = 0;
        tadpole.messages.push(new Message(data.message));
    }

    this.closedHandler = function(data) {
        if (scene.tadpoles[data.id]) {
            delete scene.tadpoles[data.id];
            delete scene.arrows[data.id];
        }
    }

    this.redirectHandler = function(data) {
        if (data.url) {
            if (authWindow) {
                authWindow.document.location = data.url;
            } else {
                document.location = data.url;
            }
        }
    }

    this.processMessage = function(data) {
        var fn = webSocketService[data.type + 'Handler'];
        if (fn) {
            fn(data);
        }
    }

    this.connectionClosed = function() {
        webSocketService.hasConnection = false;
        $('#cant-connect').fadeIn(300);
    };

    this.sendUpdate = function(tadpole) {
        var sendObj = {
            type: 'update',
            x: tadpole.x.toFixed(1),
            y: tadpole.y.toFixed(1),
            angle: tadpole.angle.toFixed(3),
            momentum: tadpole.momentum.toFixed(3),
            name: tadpole.name,
            gender: tadpole.gender,
            terminal: tadpole.terminal,
            weiboID: tadpole.weiboID
        };

        webSocket.send(JSON.stringify(sendObj));
    }

    // send config
    this.sendConfig = function() {

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


    this.sendMessage = function(msg) {
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
            message: msg
        };

        webSocket.send(JSON.stringify(sendObj));
    }

    this.authorize = function(token, verifier) {
        var sendObj = {
            type: 'authorize',
            token: token,
            verifier: verifier
        };

        webSocket.send(JSON.stringify(sendObj));
    }
}