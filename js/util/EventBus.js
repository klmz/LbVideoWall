//Singleton class that takes care of broadcasting events across the multiwindowed application through localstorage
var EventBus = function(){
	this.lsKey = "event";
	this.listeners = [];

	//Setup event listener to listen to events from localstorage changes
	window.addEventListener("storage", function(bus){ return function(e){ bus.onStorageChanged(e) };}(this) ,false);
}
EventBus.prototype.constructor = EventBus;

/*
	Add a callback which is called when the specified eventName is emitted.
	EventName - the event to subscribe to
	context - the calling context to call the callback function in
	callback - the callback function
*/
EventBus.prototype.subscribe = function(eventName, context, callback) {
	if(!this.listeners[eventName]){
		this.listeners[eventName] = [];
	}
	this.listeners[eventName].push({"context" : context, "callback" : callback});
};

/*	
	Emit an event.
	eventName - the event to emit
	arguments - the arguments supplied to the callback function
	storageInitiated - A boolean that decides if the event is to be emitted on localstorage
*/
EventBus.prototype.emit = function(eventName, arguments, storageInitiated) {
	if(storageInitiated === "undefined"){
		storageInitiated = false;
	}
	var listeners = this.listeners[eventName];
	for(var i = 0; i<listeners.length;i++){
		var listener = listeners[i];
		listener.callback.apply(listener.context, arguments);
	}

	if(!storageInitiated){
		this.emitOnLocalStorage(eventName, arguments);
	}
};

/*
	Sends the event through localstorage
*/
EventBus.prototype.emitOnLocalStorage = function(eventName, arguments) {
	//arguments need to be serialized before they are put into localstorage.

	var serializedArguments = this.serializeArray(arguments);
	var jsonObj = {"name" : eventName,
					"arguments" : serializedArguments,
					"timestamp" : Date.now()}; 
	localStorage.setItem(this.lsKey, JSON.stringify(jsonObj));
};

/*
	This function takes an array of objects that are serializable to json.
	if an incompatible object is present a fatal error is thrown
*/
EventBus.prototype.serializeArray = function(a) {
	var s = [];
	for(var i = 0; i<a.length;i++){
		var el = a[i];
		if(typeof el === "string" || el instanceof String || !isNaN(el)){//it's a string or a number
			s.push(el);
		}else if(el instanceof Object && typeof el.toJson === "function"){//it is an object that has a toJson function
			s.push(el.toJson());
		}else{
			throw new Error("This object is not serializable, it has no toJson function", el);
		}
	}
	return s;
};

/*
	This function takes an array of serialized objects and creates new objects based on the serialization data
*/
EventBus.prototype.unSerializeArray = function(a) {
	var s = [];
	for(var i = 0; i<a.length;i++){
		var el = a[i];
		if(typeof el === "string" || el instanceof String || !isNaN(el)){//it's a string or a number
			s.push(el);
		}else if(el instanceof Object){//it is an object that has a toJson function
			s.push(this.fromJson(el));
		}
	}
	return s;
};

/*
	This function can take a json object and instantiate the Object described by it
*/
EventBus.prototype.fromJson = function(json) {
	if(!json.hasOwnProperty("className")){
		throw new Error("The provided json does not include a className, the object cannot be instantiated", json);
	}
	var fromJson = this.getJsonBuilder(json.className);
	return fromJson(json);
};
/*
	Given a string, this function returns a function to instantiate an object
*/	
EventBus.prototype.getJsonBuilder = function(objectName){
	objectName +=".fromJson";
	var arr = objectName.split(".");

	var fn = (window || this);
	for (var i = 0, len = arr.length; i < len; i++) {
		fn = fn[arr[i]];
	}

	if (typeof fn !== "function") {
		throw new Error("function not found", objectName, fn);
	}

	return  fn;
}
/*
	Called when the localstorage changes
*/
EventBus.prototype.onStorageChanged = function(storageEvent) {
	if(storageEvent.key !== this.lsKey){
		return ;
	}

	var e = JSON.parse(localStorage.getItem(storageEvent.key));
	var args = this.unSerializeArray(e.arguments);
	this.emit(e.name, args, true);
};

module.exports = EventBus;