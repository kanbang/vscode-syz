var Scene = function(canvas, context) {
  var scene = this;

  this.tadpoles = {};
  this.userTadpole;
  this.waterParticles = [];
  this.camera = null;
  this.settings;

  this.update = function(mouse) {
    scene.camera.update(scene);

    // Update tadpoles
    for (var id in scene.tadpoles) {
      scene.tadpoles[id].update(mouse);
    }

    // Update waterParticles
    var bounds = scene.camera.getOuterBounds();
    for (var i in scene.waterParticles) {
      scene.waterParticles[i].update(bounds);
    }
  };

  this.draw = function() {
    scene.camera.setupContext();

    // Draw waterParticles
    for (var i in scene.waterParticles) {
      scene.waterParticles[i].draw(context);
    }

    // Draw tadpoles
    for (var id in scene.tadpoles) {
      scene.tadpoles[id].draw(context);
    }

    // Start UI layer (reset transform matrix)
    scene.camera.startUILayer();

    // Draw arrows
    var cameraBounds = scene.camera.getBounds();
    var bounds = {
      min: {
        x: cameraBounds[0].x,
        y: cameraBounds[0].y
      },
      max: {
        x: cameraBounds[1].x,
        y: cameraBounds[1].y
      },
      cen: {
        x: scene.camera.x,
        y: scene.camera.y
      }
    };

    for (var id in scene.tadpoles) {
      scene.tadpoles[id].drawArrow(canvas, context, bounds);
    }

    //kk wx must do
    // context.draw();
  };

  this.initUserID = function(id) {
    scene.userTadpole.id = id;
    scene.tadpoles[scene.userTadpole.id] = scene.userTadpole;
    delete scene.tadpoles[-1];
  };

  // Constructor
  (function() {
    scene.userTadpole = new Tadpole();
    scene.userTadpole.id = -1;
    scene.tadpoles[scene.userTadpole.id] = scene.userTadpole;

    for (var i = 0; i < 150; i++) {
      scene.waterParticles.push(new WaterParticle());
    }

    scene.camera = new Camera(canvas, context, scene.userTadpole.x, scene.userTadpole.y);

    //测试
    // for(var i=0; i<20; i++)
    // {
    //   var tad = new Tadpole();
    //   scene.tadpoles[i+1] = tad;
    // }

  })();
}