var Scene = require("./Scene");
var ViewBuilder = require("../js/util/ViewBuilder");

var OMGScene = function() {
    Scene.call(this, "OMG You Guys!");
}

OMGScene.prototype = Object.create(Scene.prototype);

OMGScene.prototype.constructor = OMGScene;

/*
    Returns the ID of this scenes. This should return a String, and should be overwritten by the scene implementation   
*/
OMGScene.prototype.getId = function() {
    return "OMGScene";
};

/*
    This method is called when the elements used in this scenes have to be added to the stage
*/
OMGScene.prototype.buildScene = function(stage) {

    // Create a cube used to build the floor and walls
    var cube = new THREE.CubeGeometry(200, 1, 200);

    // create different materials
    this.materials['floorMat'] = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('images/wood-floor.jpg')
    });
    this.materials['wallMat'] = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('images/bricks.jpg')
    });
    this.materials['redMat'] = new THREE.MeshPhongMaterial({
        color: 0xff3300,
        specular: 0x555555,
        shininess: 30
    });
    this.materials['purpleMat'] = new THREE.MeshPhongMaterial({
        color: 0x6F6CC5,
        specular: 0x555555,
        shininess: 30
    });

    // Floor
    this.objects['floor'] = new THREE.Mesh(cube, this.materials['floorMat']);
    stage.add(this.objects['floor']);

    // Knot thingy
    this.objects['knot'] = new THREE.Mesh(new THREE.TorusKnotGeometry(40, 3, 100, 16), this.materials['purpleMat']);
    this.objects['knot'].position.set(0, 60, 30);
    stage.add(this.objects['knot']);

    // Add lights
    this.addDefaultLights(stage);

};

OMGScene.prototype.addDefaultLights = function(stage) {
    this.lights['dirLight'] = new THREE.DirectionalLight(0xffffff, 1);
    this.lights['dirLight'].position.set(100, 100, 50);
    stage.add(this.lights['dirLight']);

    this.lights['ambLight'] = new THREE.AmbientLight(0x404040);
    // this.scene.add(ambLight);
    this.bluePoint = new THREE.PointLight(0x0033ff, 3, 150);
    this.bluePoint.position.set(70, 50, 70);
    // this.scene.add(new THREE.PointLightHelper(bluePoint, 3));

    this.lights['greenPoint'] = new THREE.PointLight(0x33ff00, 1, 150);
    this.lights['greenPoint'].position.set(-70, 5, 70);
    stage.add(this.lights['greenPoint']);

    stage.add(new THREE.PointLightHelper(this.lights['greenPoint'], 3));
    this.lights['spotLight'] = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
    this.lights['spotLight'].position.set(0, 150, 0);

    var spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    this.lights['spotLight'].target = spotTarget;

    stage.add(this.lights['spotLight']);
};

/*
    This method is called when such changes are made that elements in the scene may need an WebGl update
*/
OMGScene.prototype.update = function() {
    this.updateMaterials();
}

/*
    The method animateIn should define the animations that have to be played when a scene is transitioned in
*/
OMGScene.prototype.animateIn = function(callback) {
    Logger.warn("animateIn has not been implemented", this);
};

/*
    The method animateOut should define the animations that have to be played when a scene is transitioned out
*/
OMGScene.prototype.animateOut = function(callback) {
    Logger.debug("Animating Out, impl");
    Scene.prototype.animateOut.call(this, callback);
};

OMGScene.prototype.buildEditorView = function() {
    var root = document.createElement("div");
    var h1 = document.createElement("h1");
    h1.appendChild(document.createTextNode(this.name));
    root.appendChild(h1);
    var enableEditButton = ViewBuilder.btn("Enable Edit Mode", function(scene) {
        return function() {
            EventBus.emit("EnableEditMode", [scene.getId()]);
        };
    }(this))
    var disableEditButton = ViewBuilder.btn("Disable Edit Mode", function(scene) {
        return function() {
            EventBus.emit("DisableEditMode", [scene.getId()]);
        };
    }(this))

    //Attach all children to the root
    root.appendChild(enableEditButton);
    root.appendChild(disableEditButton);
    return root;
}

module.exports = OMGScene