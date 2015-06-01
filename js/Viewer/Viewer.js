
var Viewer = function() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.stage = null;
    this.camera = null;
    this.controls = null;
    this.transformControls = null;
    this.renderer = null;
    this.loadedScene = null;
    this.canvas = null;
    this.context = null;
    this.materials = {};
    this.scenes = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.renderMode = Viewer.RenderMode.THREEJS;
    this.drawables = [];
    EventBus.subscribe("SceneLoaded", this, this.sceneLoaded);
    EventBus.subscribe("RequestScene", this, this.requestScene);
    EventBus.subscribe("RemoveScene", this, this.removeScene);
    EventBus.subscribe("EnableEditMode", this, this.enableEditMode);
    EventBus.subscribe("DisableEditMode", this, this.disableEditMode);
}
Viewer.RenderMode = {
    'THREEJS': 0,
    'CANVAS': 1
};

Viewer.prototype.constructor = Viewer;



Viewer.prototype.init = function() {
    this.stage = new THREE.Scene();

    // Add the camera
    this.camera = new THREE.PerspectiveCamera(70, this.W / this.H, 1, 1000);
    this.camera.position.set(0, 100, 250);
    this.camera.rotation.set(0, 0, 0);
    console.log(this.camera.fov);
    // Create the WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    // this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(this.W, this.H);

    // Append the renderer to the body
    document.body.appendChild(this.renderer.domElement); //3d

    //Add 2d rendereree
    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("twoD");
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.context = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);

    // Add a resize event listener
    window.addEventListener('resize', this.onWindowResize, false);

    // Add the orbit controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new THREE.Vector3(0, 100, 0);

    //Setup transform controls
    this.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
    // this.transformControls.addEventListener('change', this.render);
    this.stage.add(this.transformControls);

    //Start animation loop
    this.animate();
};

Viewer.prototype.requestScene = function(sceneName) {
    //TODO check if sceneName exits

    //Check if requested scene is current scene
    //Remove old scene if there is one.
    if (this.loadedScene != null) {
        if (this.loadedScene.getId() === sceneName) {
            return;
        }
        this.loadedScene.animateOut(function(v) {
            return function() {
                v.loadScene(sceneName, function() {
                    v.loadedScene.animateIn();
                });
            };
        }(this));
    } else {
        this.loadScene(sceneName);
    }
}

Viewer.prototype.loadScene = function(sceneName, callback) {
    //Set the current scene
    this.loadedScene = this.scenes[sceneName];

    //Build the scene
    this.loadedScene.buildScene(this.stage);

    //Let everything now the scene is loaded
    EventBus.emit("SceneLoaded", [sceneName]);

    //Fire callback if defined
    if (callback) {
        callback();
    }
};

Viewer.prototype.removeScene = function() {
    //Remove old scene if there is one.
    if (this.loadedScene != null) {
        this.loadedScene.animateOut(function(v) {
            return function() {};
        }(this));
    }
}

Viewer.prototype.enableEditMode = function(name) {
    //Make objects selectable
    this.mouseUpFunc = function(viewer) {
        return function(e) {
            viewer.onMouseUp.call(viewer, e);
        };
    }(this);

    this.mouseDownFunc = function(viewer) {
        return function(e) {
            viewer.onMouseDown.call(viewer, e);
        };
    }(this);

    document.addEventListener("mouseup", this.mouseUpFunc, false);
    document.addEventListener("mousedown", this.mouseDownFunc, false);
};

Viewer.prototype.disableEditMode = function(name) {
    document.removeEventListener("mouseup", this.mouseUpFunc);
    document.removeEventListener("mousedown", this.mouseDownFunc);
};

Viewer.prototype.onMouseUp = function(e) {
    var pos = {
        'x': (event.clientX / this.W) * 2 - 1,
        'y': -(event.clientY / this.H) * 2 + 1
    };
    var intersects = this.getIntersects(pos, this.stage.children);
    if (intersects.length > 0) {
        var object = intersects[0].object;
        this.select(object);
    } else {
        this.select(null);
    }

};
Viewer.prototype.onMouseDown = function(e) {};
Viewer.prototype.select = function(object) {
    if (this.selectedObject) {
        this.transformControls.detach(this.selectedObject);
    }

    if (object === null) {
        return;
    }

    this.selectedObject = object;
    this.transformControls.attach(this.selectedObject);
}
Viewer.prototype.getIntersects = function(point, object) {
    this.mouse.set(point.x, point.y);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (object instanceof Array) {
        return this.raycaster.intersectObjects(object);
    }
    return this.raycaster.intersectObject(object);

};

Viewer.prototype.registerScene = function(scene) {
    //Set parent of scene to this viewer
    scene.viewer = this;

    //Register it
    this.scenes[scene.getId()] = scene;
};

Viewer.prototype.unRegisterScene = function(scene) {
    this.scenes[scene.getId()].viewer = null;
    delete this.scenes[scene.getId()];
};

Viewer.prototype.sceneLoaded = function(sceneName) {
    Logger.debug("Scene loaded: ", sceneName);
};

Viewer.prototype.onWindowResize = function() {
    this.camera.aspect = this.W / this.H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.W, this.H);
};

Viewer.prototype.setRenderMode = function(mode) {
    if (mode === this.renderMode) {
        return;
    }
    this.renderMode = mode;

    switch (this.renderMode) {
        case Viewer.RenderMode.THREEJS:
            this.renderer.domElement.style.display = "block";
            this.canvas.style.display = "none";
            break;
        case Viewer.RenderMode.CANVAS:
            this.renderer.domElement.style.display = "none";
            this.canvas.style.display = "block";
            for (var i = 0; i < this.drawables.length; i++) {
                var d = this.drawables[i];
                d.draw();
            }
            break;
    }
};

Viewer.prototype.animate = function() {
    if (this.loadedScene) {
        this.loadedScene.render();
    }

    switch (this.renderMode) {
        case Viewer.RenderMode.THREEJS:
            this.renderer.render(this.stage, this.camera);
            this.controls.update();
            break;
        case Viewer.RenderMode.CANVAS:
            console.log('canvas');
            break;
    }
    requestAnimationFrame(function(v) {
        return function() {
            v.animate()
        };
    }(this));

};

module.exports = Viewer;

