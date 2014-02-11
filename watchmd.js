var express    = require('express');
var Handlebars = require('Handlebars');
var fs         = require('fs');

var watchmd = function(options) {
	options = options || {};

	var templateFile = options.templateFile || 'template.hbs';
	var template     = Handlebars.compile(fs.readFileSync(templateFile, {encoding:'utf8'}));

	var file = options.watchFile || 'example.md';
	var enableStyle = options.enableStyle;

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

	var app    = require('express')();
	var server = require('http').createServer(app);
	var io     = require('socket.io').listen(server, { 'destroy upgrade': false });

	//Assets Route
	app.get('/assets/:file', function(req, res) {
		res.sendfile('./assets/'+req.param('file'));
	});

	app.get('/', function(req, res){
		fs.readFile(file, {encoding:'utf8'}, function(err, str) {
			if(err) return res.send(500, err);
			marked(str, function(err, content) {
				if(err) return res.send(500, err);
				res.set({'Content-Type': 'text/html'});
				res.send(200, template({
					markdown : content,
					style    : enableStyle
				}) );
			});
		});
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
	server.listen(options.port);

	//Open a new Browser
	if(options.spawn) {
		var spawn = require('child_process').spawn;
		spawn('open', ['http://localhost:3333']);
	}

};

module.exports = watchmd;