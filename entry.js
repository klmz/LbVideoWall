console.log("Initializing");
var a = require("./js/util/EventBus");
var b = require("./js/util/Logger");

var Controller = require("./js/Controller/Controller");
var Viewer = require("./js/Viewer/Viewer");

//Create singletons
EventBus = new a();
Logger = new b(0);

//Load Scene classes
var HarvardVariationsScene = require("./scenes/HarvardVariationsScene");
var OMGScene = require("./scenes/OMG");


//Check hash to start the right version of the applications
var hash = window.location.hash.substring(1);
router = {
    controller: function() {
        // init controller
        var controller = new Controller();
        controller.registerScene(new HarvardVariationsScene());
        controller.registerScene(new OMGScene());
        console.log(controller);
    },
    viewer: function() {
        viewer = new Viewer();
        viewer.init();

        viewer.registerScene(new HarvardVariationsScene());
        viewer.registerScene(new OMGScene());
        EventBus.emit("RequestScene", ["OMGScene"], true)
    }
}

if (router.hasOwnProperty(hash)) {
    Logger.info("Routing to " + hash);
    router[hash]();
} else {

    throw new Error("There is no route like this: " + hash);
}

//init viewer
console.log("Done");
