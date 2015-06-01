var Scene = require("./Scene");
var ViewBuilder = require("../js/util/ViewBuilder");
var Viewer = require("../js/Viewer/Viewer");
var ProfScene = function() {
    Scene.call(this, "Prof scene");
    this.video = null;
    EventBus.subscribe("Prof_PlayVideo", this, function(scene) {
        return function() {
            if (this.viewer) {
                console.log(scene);
                scene.video.play();
            }

        }
    }(this));
    EventBus.subscribe("Prof_PauseVideo", this, function(scene) {
        return function() {
            if (this.viewer) {
                scene.video.pause();
            }
        }
    }(this));
    EventBus.subscribe("Prof_ResetVideo", this, function(scene) {
        return function() {
            if (this.viewer) {
                scene.video.currentTime = 0;
            }
        }
    }(this));

    EventBus.subscribe("Prof_AnimateIn", this, function(scene) {
        return scene.animateIn
    }(this));
    EventBus.subscribe("Prof_AnimateToVideo", this, function(scene) {
        return scene.animateToVideo
    }(this));
    EventBus.subscribe("Prof_StartVideo", this, function(scene) {
        return scene.animateStartVideo
    }(this));
    EventBus.subscribe("Prof_StopVideo", this, function(scene) {
        return scene.animateStopVideo
    }(this));
    EventBus.subscribe("Prof_ToBlack", this, function(scene) {
        return scene.animateToBlack
    }(this));
    EventBus.subscribe("Prof_ToSplashScreen", this, function(scene) {
        return scene.animateIn
    }(this));
}

ProfScene.prototype = Object.create(Scene.prototype);

ProfScene.prototype.constructor = ProfScene;

/*
    Returns the ID of this scenes. This should return a String, and should be overwritten by the scene implementation   
*/
ProfScene.prototype.getId = function() {
    return "ProfScene";
};

/*
    This method is called when the elements used in this scenes have to be added to the stage
*/
ProfScene.prototype.buildScene = function(stage) {

    this.viewer.setRenderMode(Viewer.RenderMode.THREEJS);
    // Create a cube used to build the floor and walls
    var cube = new THREE.CubeGeometry(200, 200, 1);
    var videoCube = new THREE.CubeGeometry(960, 540, 1);
    // create different materials
    this.materials['floorMat'] = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('images/harvard_logo.jpg')
    });

    //Create VideoPlayer
    this.video = document.createElement('video');
    this.video.width = 1920;
    this.video.height = 1080;
    this.video.currentTime = 1000;
    this.video.src = "/images/essayfilm.mp4"
    document.body.appendChild(this.video);
    //Add event listener to animate to splashscreen when the video ends
    this.video.addEventListener('ended', function(scene) {
        return function() {

            var tl = new TimelineMax();
            tl.add(function() {
                console.log(scene);scene.animateStopVideo()
            }, "+=1");
        }
    }(this), false);

    this.videoTexture = new THREE.Texture(this.video);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.materials['videoMat'] = new THREE.MeshLambertMaterial({
        map: this.videoTexture
    });

    this.objects['floor'] = new THREE.Mesh(cube, this.materials['floorMat']);

    stage.add(this.objects['floor']);



    this.objects['video'] = new THREE.Mesh(videoCube, this.materials['videoMat']);
    this.objects['video'].position.z = -600;
    stage.add(this.objects['video']);

    // Add lights
    this.addDefaultLights(stage);

    //set cmera
    var c = this.viewer.camera;

    distance = (200 * 1 / Math.tan(((c.fov * Math.PI) / 360))) / (2 * c.aspect);
    var bb = new THREE.Box3()
    bb.setFromObject(this.objects['video']);
    bb.center(this.viewer.controls.target);
    c.position.x = 0;
    c.position.y = 0;
    c.position.z = distance;
};

ProfScene.prototype.addDefaultLights = function(stage) {
    // this.lights['dirLight'] = new THREE.DirectionalLight(0xEEEEEE, 1);
    // this.lights['dirLight'].position.set(100, 100, 50);
    // stage.add(this.lights['dirLight']);

    this.lights['ambLight'] = new THREE.AmbientLight(0xEEEEEE);
    stage.add(this.lights['ambLight']);
    // this.scene.add(ambLight);
    this.bluePoint = new THREE.PointLight(0x0033ff, 3, 150);
    this.bluePoint.position.set(70, 50, 70);
    // this.scene.add(new THREE.PointLightHelper(bluePoint, 3));

    // this.lights['greenPoint'] = new THREE.PointLight(0x33ff00, 1, 150);
    // this.lights['greenPoint'].position.set(-70, 5, 70);
    // stage.add(this.lights['greenPoint']);

    // stage.add(new THREE.PointLightHelper(this.lights['greenPoint'], 3));
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
ProfScene.prototype.update = function() {
    this.updateMaterials();
}

/*
    This method is called by the render loop, this allows the scene to update on every frame, this method is optional
*/
ProfScene.prototype.render = function() {

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA && this.videoTexture) {
        this.videoTexture.needsUpdate = true;
    }
}
/*
    The method animateIn should define the animations that have to be played when a scene is transitioned in
*/
ProfScene.prototype.animateIn = function(callback) {
    console.log(this);
    if (!this.objects['floor']) {
        return;
    }
    var c = this.viewer.camera;

    distance = (200 * 1 / Math.tan(((c.fov * Math.PI) / 360))) / (2 * c.aspect);
    console.log(distance);
    console.log(this.objects['floor'].position.z - distance);
    // var bb = new THREE.Box3()
    // bb.setFromObject(this.objects['floor']);
    // bb.center(this.viewer.controls.target);

    this.video.pause();
    var tl = new TimelineMax();
    tl.to(c.position, 2, {
        x: 0,
        y: 0,
        z: distance,
        ease: Power4.easeInOut
    })
    tl.play();
};

ProfScene.prototype.animateToVideo = function(callback) {
    console.log(this);
    if (!this.objects['video']) {
        return;
    }

    var c = this.viewer.camera;
    distance = (960 * 1 / Math.tan(((c.fov * Math.PI) / 360))) / (2 * c.aspect);

    // var bb = new THREE.Box3()
    // bb.setFromObject(this.objects['video']);
    // bb.center(this.viewer.controls.target);

    var tl = new TimelineMax();
    tl.to(c.position, 4, {
        x: 0,
        y: 0,
        z: this.objects['video'].position.z + distance,
        ease: Power4.easeOut
    })
    tl.play();
};

ProfScene.prototype.animateStartVideo = function(callback) {
    console.log(this);
    if (!this.objects['video']) {
        return;
    }

    var c = this.viewer.camera;
    distance = (960 * 1 / Math.tan(((c.fov * Math.PI) / 360))) / (2 * c.aspect);

    // var bb = new THREE.Box3()
    // bb.setFromObject(this.objects['video']);
    // bb.center(this.viewer.controls.target);

    // this.video.currentTime = 110;
    this.video.currentTime = 0;

    var tl = new TimelineMax();
    tl
        .to(c.position, 4, {
            x: 0,
            y: 0,
            z: this.objects['video'].position.z + distance,
            ease: Power4.easeOut
        })
        .add(function(scene) {
            return function() {
                scene.video.play()
            };
        }(this), "-=3.5");


    tl.play();
};

ProfScene.prototype.animateStopVideo = function(callback) {
    console.log(this);
    if (!this.objects['floor']) {
        return;
    }
    var c = this.viewer.camera;

    distance = (200 * 1 / Math.tan(((c.fov * Math.PI) / 360))) / (2 * c.aspect);
    console.log(distance);
    console.log(this.objects['floor'].position.z - distance);
    // var bb = new THREE.Box3()
    // bb.setFromObject(this.objects['floor']);
    // bb.center(this.viewer.controls.target);

    this.video.pause();
    var tl = new TimelineMax();
    tl.to(c.position, 4, {
        x: 0,
        y: 0,
        z: distance,
        ease: Power4.easeOut
    }).add(function(scene) {
        return function() {
            scene.video.pause()
        };
    }(this), "-=3");
    tl.play();
}

ProfScene.prototype.animateToBlack = function(callback) {
    console.log(this);
    if (!this.objects['floor']) {
        return;
    }
    var c = this.viewer.camera;

    distance = c.far + 400;

    // var bb = new THREE.Box3()
    // bb.setFromObject(this.objects['floor']);
    // bb.center(this.viewer.controls.target);

    this.video.pause();
    var tl = new TimelineMax();
    tl.to(c.position, 1, {
        x: 0,
        y: 300,
        ease: Power4.easeIn
    }).add(function(scene) {
        return function() {
            scene.video.currentTime = 0;
        };
    }(this), "-=3.5");
    tl.play();
}

/*
    The method animateOut should define the animations that have to be played when a scene is transitioned out
*/
ProfScene.prototype.animateOut = function(callback) {
    Logger.debug("Animating Out, impl");
    Scene.prototype.animateOut.call(this, callback);
};

ProfScene.prototype.buildEditorView = function() {
    var root = document.createElement("div");
    var h1 = document.createElement("h1");
    h1.appendChild(document.createTextNode(this.name));
    root.appendChild(h1);
    //GENERAL CONTROLS
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
    var animateInBtn = ViewBuilder.btn("Animate In", function(scene) {
        return function() {
            EventBus.emit("Prof_AnimateIn", []);
        };
    }(this))
    var animatetToVideoBtn = ViewBuilder.btn("Animate to Video", function(scene) {
        return function() {
            EventBus.emit("Prof_AnimateToVideo", []);
        };
    }(this))


    //VIDEO CONTROLS
    var videoControls = document.createElement("div");
    var videoH = document.createElement("h2");
    videoH.appendChild(document.createTextNode("Video Controls"));
    videoControls.appendChild(videoH);

    var playButton = ViewBuilder.btn("Play video", function(scene) {
        return function() {
            EventBus.emit("Prof_PlayVideo", []);
        };
    }(this))

    var pauseButton = ViewBuilder.btn("Pause video", function(scene) {
        return function() {
            EventBus.emit("Prof_PauseVideo", []);
        };
    }(this))

    var resetButton = ViewBuilder.btn("Reset video", function(scene) {
        return function() {
            EventBus.emit("Prof_ResetVideo", []);
        };
    }(this))

    videoControls.appendChild(playButton);
    videoControls.appendChild(pauseButton);
    videoControls.appendChild(resetButton);

    //TIMELINE CONTROLS
    var timelineControls = document.createElement("div");
    var tlH = document.createElement("h2");
    tlH.appendChild(document.createTextNode("Timeline Controls"));
    timelineControls.appendChild(tlH);

    var startVideo = ViewBuilder.btn("Start video", function(scene) {
        return function() {
            EventBus.emit("Prof_StartVideo", []);
        };
    }(this), {
            'type': 'btn-success',
            'classes': 'btn-lg'
        })

    var endVideo = ViewBuilder.btn("End video", function(scene) {
        return function() {
            EventBus.emit("Prof_StopVideo", []);
        };
    }(this), {
            'type': 'btn-danger',
            'classes': 'btn-lg'
        })

    var toHarvardSplash = ViewBuilder.btn("To Splash screen", function(scene) {
        return function() {
            EventBus.emit("Prof_ToSplashScreen", []);
        };
    }(this), {
            'type': 'btn-warning',
            'classes': 'btn-lg'
        })

    var toBlack = ViewBuilder.btn("To Black video", function(scene) {
        return function() {
            EventBus.emit("Prof_ToBlack", []);
        };
    }(this), {
            'type': 'btn-warning',
            'classes': 'btn-lg'
        })

    timelineControls.appendChild(startVideo);
    timelineControls.appendChild(endVideo);
    timelineControls.appendChild(toHarvardSplash);
    timelineControls.appendChild(toBlack);

    root.appendChild(animatetToVideoBtn);
    root.appendChild(enableEditButton);
    root.appendChild(disableEditButton);
    root.appendChild(animateInBtn);

    root.appendChild(videoControls);
    root.appendChild(timelineControls);
    return root;
}

module.exports = ProfScene