var argv    = require('minimist')(process.argv.slice(2));
var watchmd = require('./watchmd');

var options = {
	port        : argv.port   || 3333,
	watchFile   : argv.f      || 'example.md',
	enableStyle : (argv.style !== undefined) ? (argv.style=='true') : true,
	spawn       : (argv.spawn !== undefined) ? (argv.spawn=='true') : true
};

watchmd(options);