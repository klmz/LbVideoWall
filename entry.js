console.log("Initializing");
var a = require("./js/util/EventBus");
EventBus = new a();
console.log(EventBus);
var Controller = require("./js/Controller/Controller");

// init controller
// var controller = new Controller();
// console.log(controller);

var Viewer = require("./js/Viewer/Viewer");
viewer = new Viewer();
viewer.init()
//init viewer
console.log("Done");
