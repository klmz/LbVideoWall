//Views

var Controller = function() {
    //Create root node
    this.buildSkeleton();

    //Keep a list of all the scenes, and update the list if anything changes.
    this.scenes = [];
    Object.observe(this.scenes, function(c) {
        return function() {
            c.buildSceneList()
        };
    }(this));
    EventBus.subscribe("RequestScene", this, function(name) {
        console.log(name)
    });
    EventBus.subscribe("SceneLoaded", this, function(me) {
        return function(name) {
            console.log("Showing editor for ", this.scenes[name]);
            me.showEditor(name);
        };
    }(this));
    EventBus.subscribe("PositionChanged", this, function(scene, object, position) {
        console.log(scene, object, position)
    });
}

Controller.prototype.buildSkeleton = function() {
    this.root = document.createElement("div");
    document.body.appendChild(this.root);

    this.menuPane = document.createElement("div");
    this.menuPane.classList.add("menu");
    this.menuPane.classList.add("pane");
    this.root.appendChild(this.menuPane);

    this.detailPane = document.createElement("div");
    this.detailPane.classList.add("detail");
    this.detailPane.classList.add("pane");
    this.root.appendChild(this.detailPane);
}
Controller.prototype.registerScene = function(scene) {
    //Set parent of scene to this controller
    scene.controller = this;

    //Register it
    this.scenes[scene.getId()] = scene;
};

Controller.prototype.unRegisterScene = function(scene) {
    this.scenes[scene.getId()].controller = null;
    delete this.scenes[scene.getId()];
};

Controller.prototype.getArrayOfScenes = function() {
    var scenesArray = [];
    for (var prop in this.scenes) {
        if (this.scenes.hasOwnProperty(prop)) {
            scenesArray.push(this.scenes[prop]);
        }
    }
    return scenesArray
};
Controller.prototype.buildSceneList = function() {
    // Render the menu component on the page, and pass an array with menu options
    var ul = document.createElement("ul");
    ul.classList.add("sceneList");
    var scenes = this.getArrayOfScenes();
    for (var i = 0; i < scenes.length; i++) {
        var scene = scenes[i];
        var text = document.createTextNode(scene.name);
        var li = document.createElement("li");
        li.appendChild(text);
        li.onclick = function(s) {
            return function() {
                console.log(s);
                s.request();
            }
        }(scene);
        ul.appendChild(li);
    }

    var sliderX = document.createElement("input");
    sliderX.type = 'range';
    sliderX.min = 0;
    sliderX.max = 1000;
    sliderX.oninput = function(e) {
        EventBus.emit("PositionChanged", ["sphere", e.target.value, 0, 0])
    }
    this.menuPane.appendChild(sliderX);
    this.menuPane.appendChild(ul);
};

Controller.prototype.showEditor = function(name) {
    var scene = this.scenes[name];
    while (this.detailPane.firstChild) {
        this.detailPane.removeChild(this.detailPane.firstChild);
    }
    console.log(scene.buildEditorView());
    this.detailPane.appendChild(scene.buildEditorView());

}
module.exports = Controller;