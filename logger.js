var winston = require('winston');
var moment = require('moment');

var logger = new winston.Logger({
	transports : [
	new  winston.transports.Console({
		level: 'error',
		colorize: true
	})
	// new winston.transports.DailyRotateFile({
		// level: 'debug',
		// filename: 'app-debug',
		// maxsize: 1000 * 1024,
		// datePattern: '.yyyy-MM-dd.log',
		// timestamp: function(){ return moment().format("YYYY-MM-DD HH:mm:ss.SSS"); }
	// })
	]
});

module.exports = logger;