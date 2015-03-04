var Model = function(name, age){
	this.name = name;
	this.age = age;
	
}

Model.prototype.constructor = Model;

Model['fromJson'] = function(json){
		return new Model(json.name, json.age);
	};

Model.prototype.toJson = function(){
	return {
				"className" : "Model",
			 	"name" : this.name, 
			 	"age" : this.age
			};
}