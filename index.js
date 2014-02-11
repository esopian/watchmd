var argv    = require('minimist')(process.argv.slice(2));
var watchmd = require('./watchmd');

var options = {
	spawn       : true,
	port        : argv.port || 3333,
	watchFile   : argv.f || 'example.md',
	enableStyle : (argv.style !== undefined) ? (argv.style=='true') : true
};

watchmd(options);