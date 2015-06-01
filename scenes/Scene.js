var Scene = function(name) {
    this.name = name;
    this.viewer = null;
    this.controller = null;
    this.materials = [];
    this.objects = [];
    this.lights = [];
    this.key = this.getId();
    Object.observe(this.objects, function(c) {
        return function(changes) {
            changes.forEach(function(change) {
                console.log(change);
                if (change.type === "add") {
                    Object.observe(c.objects[change.name].position, function(posChanges) {
                        posChanges.forEach(function(posChange) {
                            if (posChange.type === 'update') {
                                var pos = {
                                    'className': 'json',
                                    'x': c.objects[change.name].position.x,
                                    'y': c.objects[change.name].position.y,
                                    'z': c.objects[change.name].position.z
                                }
                                EventBus.emit("PositionChanged", [c.name, change.name, pos]);
                            }
                        });
                    });
                }
            });
        };
    }(this));
};

Scene.prototype.constructor = Scene;

/*
    Returns the ID of this scenes. This should return a String, and should be overwritten by the scene implementation   
*/
Scene.prototype.getId = function() {
    throw new Error("getID has not been implemented", this);
};

/*
    This method is called when the elements used in this scenes have to be added to the stage
*/
Scene.prototype.buildScene = function() {
    throw new Error("addElements has not been implemented", this);
};

/*
    This method is called when the elements used in this scenes have to be removed from the stage
*/
Scene.prototype.breakDown = function() {
    var stage = this.viewer.stage;
    for (prop in this.objects) {
        if (this.objects.hasOwnProperty(prop)) {
            stage.remove(this.objects[prop]);
            delete this.objects[prop];
        }
    }

    for (prop in this.lights) {
        if (this.lights.hasOwnProperty(prop)) {
            stage.remove(this.lights[prop]);
            delete this.lights[prop];
        }
    }

};

/*
    This method returns a elementNode that contians the editor view for this scene.
*/
Scene.prototype.buildEditorView = function() {
    throw new Error("buildEditorView has not been implemented", this);
}

/*
    This method is called when such changes are made that elements in the scene may need an WebGl update
*/
Scene.prototype.update = function() {
    throw new Error("update has not been implemented", this);
}

/*
    This method is called by the render loop, this allows the scene to update on every frame, this method is optional
*/
Scene.prototype.render = function() {};

/*
    The method animateIn should define the animations that have to be played when a scene is transitioned in
*/
Scene.prototype.animateIn = function() {
    throw new Error("animateIn has not been implemented", this);
};

/*
    The method animateOut should define the animations that have to be played when a scene is transitioned out
*/
Scene.prototype.animateOut = function(callback) {
    Logger.debug("Animating out");
    this.breakDown();
    callback();

};

/*

    Send an event to request this scene
*/
Scene.prototype.request = function() {
    EventBus.emit("RequestScene", [this.getId()]);
};
/*
    Update the materials at WebGl level
*/
Scene.prototype.updateMaterials = function() {
    for (var prop in this.materials) {
        if (this.materials.hasOwnProperty(prop)) {
            this.materials[prop].needsUpdate = true;
        }
    }
};

module.exports = Scene;