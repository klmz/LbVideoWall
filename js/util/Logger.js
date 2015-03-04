var Logger = function(minLevel){
	if(typeof minLevel === 'undefined'){
		minLevel = 0;
	}
	this.minLevel = minLevel;
}

Logger.level = {	
				   	"Debug" : 0,
				   	"Log" : 1,
				   	"Info" : 2,
					"Warning" : 3,
					"Error": 4
				};

Logger.prototype.constructor = Logger;

Logger.prototype.debug = function() {
	this.doLog(0, arguments);
}
Logger.prototype.log = function() {
	this.doLog(1, arguments);
}
Logger.prototype.info = function() {
	this.doLog(2, arguments);
}
Logger.prototype.warn = function() {
	this.doLog(3, arguments);
}
Logger.prototype.error = function() {
	this.doLog(4, arguments);
}

Logger.prototype.doLog = function(level, args) {
	if(level >= this.minLevel){
		switch(level){
			case 0:
				console.debug(args);
			break;
			case 1:
				console.log(args);
			break;
			case 2:
				console.info(args);
			break;
			case 3:
				console.warn(args);
			break;
			case 4:
				console.error(args);
			break;
		}
	}
};

module.exports = Logger;