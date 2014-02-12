var express    = require('express');
var Handlebars = require('Handlebars');
var fs         = require('fs');
var path       = require('path');

var watchmd = function(options) {
    options = options || {};

    var cwd = process.cwd();

    var templateFile = path.resolve(cwd, options.templateFile || __dirname+'/template.hbs');
    var template     = Handlebars.compile(fs.readFileSync(templateFile, {encoding:'utf8'}));

    var file = path.resolve(cwd, options.watchFile || __dirname+'/example.md');
    var style = options.style;

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
    var io     = require('socket.io').listen(server, {
        'log level'       : 0,
        'destroy upgrade' : false
    });

    //Assets Route
    app.get('/assets/:file', function(req, res) {
        res.sendfile(__dirname+'/assets/'+req.param('file'));
    });

    app.get('/', function(req, res){
        fs.readFile(file, {encoding:'utf8'}, function(err, str) {
            if(err) return res.send(500, err);
            marked(str, function(err, content) {
                if(err) return res.send(500, err);
                res.set({'Content-Type': 'text/html'});
                res.send(200, template({
                    markdown : content,
                    style    : style
                }) );
            });
        });
    });


    //Setup File Watch
    console.log("Listening for change on file : "+file);
    function watchfile() {
        var mtime = null;
        var watcher = fs.watch(file, function (evt, filename) {
            if(evt == 'rename') {
                watcher.close();
                mtime = null;
                console.log('File Changed - Reloading Browser');
                io.sockets.emit('reload');
                setTimeout(watchfile, 150);
            } else {
                fs.stat(file, function(err, stats) {
                    if(err) {
                        console.log("ERROR: ", err);
                        throw new Error(err);
                    } else if(stats.mtime.getTime() > mtime) {
                        mtime = stats.mtime.getTime();
                        console.log('File Changed - Reloading Browser');
                        io.sockets.emit('reload');
                    }
                });
            }
        });
    }
    watchfile();

    io.sockets.on('connection', function (socket) {});

    console.log("Binding server to port "+options.port);
    server.listen(options.port);

    //Open a new Browser
    if(options.spawn) {
        console.log("Launching Browser....");
        var spawn = require('child_process').spawn;
        spawn('open', ['http://localhost:3333']);
    }

};

module.exports = watchmd;