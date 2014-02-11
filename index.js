var argv = require('minimist')(process.argv.slice(2));
var express = require('express');
var Handlebars = require('Handlebars');
var fs         = require('fs');

var template   = Handlebars.compile(fs.readFileSync('./template.hbs', {encoding:'utf8'}));
console.log(argv);

var file = argv.f || "example.md";
var enableStyle = (argv.style !== undefined) ? (argv.style=='true') : true;

var marked = require('marked');
marked.setOptions({
	// renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	// pedantic: false,
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
			callback(null, template({
				markdown:content,
				style : enableStyle
			}) );
		});
	});
};

app.get('/assets/:file', function(req, res) {
	res.sendfile('./assets/'+req.param('file'));
});

app.get('/', function(req, res){
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
var mtime = null;
fs.watch(file, function (event, filename) {
	if(event == 'change') {
		fs.stat(file, function(err, stats) {
			if(err) throw err;
			if(stats.mtime.getTime() != mtime) {
				mtime = stats.mtime.getTime();
				console.log('File Changed - Reloading Browser');
				io.sockets.emit('reload');
			}
		});
	}
});

console.log("Listening for change");
server.listen(3333);

//Open a new Browser
var spawn = require('child_process').spawn;
spawn('open', ['http://localhost:3333']);