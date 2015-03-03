var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static('.'));

app.get('/', function(req, res){
	  res.send('<h1>Hello world</h1>');
});

http.listen(4000, function(){
	  console.log('listening on *:4000');
});

