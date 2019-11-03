var App = function(aSettings, aCanvas) {
    var app = this;

    var scene,
        canvas,
        context,
        webSocket,
        webSocketService,
        mouse = { x: 0, y: 0, worldx: 0, worldy: 0, tadpole: null },
        keyNav = { x: 0, y: 0 },
        messageQuota = 5;

    app.update = function() {
        if (messageQuota < 5 && scene.userTadpole.age % 50 == 0) { messageQuota++; }

        // Update usertadpole
        if (keyNav.x != 0 || keyNav.y != 0) {
            scene.userTadpole.userUpdate(scene.tadpoles, scene.userTadpole.x + keyNav.x, scene.userTadpole.y + keyNav.y);
        } else {
            var mvp = getMouseWorldPosition();
            mouse.worldx = mvp.x;
            mouse.worldy = mvp.y;
            scene.userTadpole.userUpdate(scene.tadpoles, mouse.worldx, mouse.worldy);
        }

        if (scene.userTadpole.age % 6 == 0 && scene.userTadpole.changed > 1 && webSocketService.hasConnection) {
            scene.userTadpole.changed = 0;
            webSocketService.sendUpdate();
        }

        scene.update(mouse);
    };


    app.getName = function(name) {
        return scene.userTadpole.name;
    }

    app.getGender = function(gender) {
        return scene.userTadpole.gender;
    }

    app.setName = function(name) {
        scene.userTadpole.name = name;
        webSocketService.sendConfig();
    }

    app.setGender = function(gender) {
        scene.userTadpole.gender = gender;
        webSocketService.sendConfig();
    }

    app.draw = function() {
        scene.draw();
    };

    app.onSocketOpen = function(e) {
        //console.log('Socket opened!', e);

        //FIXIT: Proof of concept. refactor!
        uri = parseUri(document.location)
        if (uri.queryKey.oauth_token) {
            app.authorize(uri.queryKey.oauth_token, uri.queryKey.oauth_verifier)
        }
        // end of proof of concept code.
    };

    app.onSocketClose = function(e) {
        //console.log('Socket closed!', e);
        webSocketService.connectionClosed();
    };

    app.onSocketMessage = function(e) {
        try {
            var data = JSON.parse(e.data);
            webSocketService.processMessage(data);
        } catch (e) {}
    };

    app.sendMessage = function(msg) {

        if (messageQuota > 0) {
            messageQuota--;
            webSocketService.sendMessage(msg);
        }

    }

    app.authorize = function(token, verifier) {
        webSocketService.authorize(token, verifier);
    }

    app.mousedown = function(e) {
        mouse.clicking = true;

        if (mouse.tadpole && mouse.tadpole.hover && mouse.tadpole.onclick(e)) {
            return;
        }
        if (scene.userTadpole && e.which == 1) {
            scene.userTadpole.momentum = scene.userTadpole.targetMomentum = scene.userTadpole.maxMomentum;
        }


    };

    app.mouseup = function(e) {
        if (scene.userTadpole && e.which == 1) {
            scene.userTadpole.targetMomentum = 0;
        }
    };

    app.mousemove = function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };

    app.keydown = function(e) {
        if (e.keyCode == keys.up) {
            keyNav.y = -1;
            scene.userTadpole.momentum = scene.userTadpole.targetMomentum = scene.userTadpole.maxMomentum;
            e.preventDefault();
        } else if (e.keyCode == keys.down) {
            keyNav.y = 1;
            scene.userTadpole.momentum = scene.userTadpole.targetMomentum = scene.userTadpole.maxMomentum;
            e.preventDefault();
        } else if (e.keyCode == keys.left) {
            keyNav.x = -1;
            scene.userTadpole.momentum = scene.userTadpole.targetMomentum = scene.userTadpole.maxMomentum;
            e.preventDefault();
        } else if (e.keyCode == keys.right) {
            keyNav.x = 1;
            scene.userTadpole.momentum = scene.userTadpole.targetMomentum = scene.userTadpole.maxMomentum;
            e.preventDefault();
        }
    };
    app.keyup = function(e) {
        if (e.keyCode == keys.up || e.keyCode == keys.down) {
            keyNav.y = 0;
            if (keyNav.x == 0 && keyNav.y == 0) {
                scene.userTadpole.targetMomentum = 0;
            }
            e.preventDefault();
        } else if (e.keyCode == keys.left || e.keyCode == keys.right) {
            keyNav.x = 0;
            if (keyNav.x == 0 && keyNav.y == 0) {
                scene.userTadpole.targetMomentum = 0;
            }
            e.preventDefault();
        }
    };

    app.touchstart = function(e) {
        e.preventDefault();
        mouse.clicking = true;

        if (scene.userTadpole) {
            scene.userTadpole.momentum = scene.userTadpole.targetMomentum = scene.userTadpole.maxMomentum;
        }

        var touch = e.changedTouches.item(0);
        if (touch) {
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
        }
    }
    app.touchend = function(e) {
        if (scene.userTadpole) {
            scene.userTadpole.targetMomentum = 0;
        }
    }
    app.touchmove = function(e) {
        e.preventDefault();

        var touch = e.changedTouches.item(0);
        if (touch) {
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
        }
    }


    app.resize = function(e) {
        resizeCanvas();
    };

    var getMouseWorldPosition = function() {
        return {
            x: (mouse.x + (scene.camera.x * scene.camera.zoom - canvas.width / 2)) / scene.camera.zoom,
            y: (mouse.y + (scene.camera.y * scene.camera.zoom - canvas.height / 2)) / scene.camera.zoom
        }
    }

    var resizeCanvas = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    // Constructor
    (function() {
        canvas = aCanvas;
        context = canvas.getContext('2d');
        resizeCanvas();

        scene = new Scene(canvas, context);
        scene.settings = aSettings;

        webSocket = new WebSocket(scene.settings.socketServer);
        webSocket.onopen = app.onSocketOpen;
        webSocket.onclose = app.onSocketClose;
        webSocket.onmessage = app.onSocketMessage;

        webSocketService = new WebSocketService(scene, webSocket);
    })();
}