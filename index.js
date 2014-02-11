var argv = require('minimist')(process.argv.slice(2));
var express = require('express');
var Handlebars = require('Handlebars');
var fs         = require('fs');

var template   = Handlebars.compile(fs.readFileSync('./template.hbs', {encoding:'utf8'}));

var file = argv.f || "example.md";

var marked = require('marked');
marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	smartypants: false
});


var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, { 'destroy upgrade': false });

var renderPage = function(callback) {
	fs.readFile(file, {encoding:'utf8'}, function(err, str) {
		if(err) return callback(err);
		marked(str, function(err, content) {
			if(err) return callback(err);
			callback(null, template({markdown:content}) );
		});
	});
};

app.get('*', function(req, res){
	renderPage(function(err, result) {
		if(err) res.send(500, err);
		else    {
			res.set({'Content-Type': 'text/html'});
			res.send(200, result);
		}
	});
});

io.sockets.on('connection', function (socket) {
	console.log("socket: new socket connected");
});

//Setup File Watch
var waitTime = 150;
var waiting = false;
fs.watch(file, function (event, filename) {
	if(event == 'change' && !waiting) {
		waiting = true;
		console.log('File Changed - Reloading Browser');
		io.sockets.emit('reload');
		setTimeout(function(){ waiting = false; }, waitTime);
	}
});

console.log("Listening for change");
server.listen(3333);

//Open a new Browser
var spawn = require('child_process').spawn;
spawn('open', ['http://localhost:3333']);