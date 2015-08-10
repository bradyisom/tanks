var argv = require('yargs').argv;
var http = require('http');
var q = require('Q');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var shared = require('./shared');

var serverHost = argv.host || 'localhost';
var serverPort = argv.port || 8080;
var gameName = argv.game || 'tankyou:screen';
var playerName = argv.player || 'player';

var config = null;
var playerId = null;

function request(cmd, data) {
	var defer = q.defer();

	try {

		var options = {
			host: serverHost,
			port: serverPort,
			path: '/game/' + gameName + '/' + cmd,
			method: 'POST',
			headers: {
				'X-Sm-Playermoniker': playerName,
				'X-Sm-Playerid': playerId
			}
		};

		console.log('sending command', cmd);

		var req = http.request(options, function(res) {
			if (res.headers['x-sm-playerid']) {
				playerId = res.headers['x-sm-playerid'];
			}

			var data = '';
			res.on('data', function(chunk) {
				data += chunk;
			});

			res.on('end', function() {
				if(data) {
					data = JSON.parse(data);
					if (data.config) {
						config = data.config;
					}
					defer.resolve(_.omit(data, 'config'));
				}
				else {
					defer.resolve({});
				}
			});

		});

		req.on('error', function(e) {
			defer.reject(e.message);
		});

		if(data) {
			req.write(data);
		}
		req.end();
	}
	catch(error) {
		defer.reject(error);
	}

	return defer.promise;
};

function getConfig() {
	return config;
}

function start(turnCallback) {
	var defer = q.defer();
	var events = new EventEmitter();
	
	events.on('taketurn', function(status) {
		status = status || {};
		if(!status.status || status.status == 'running') {
			if (status.status == 'running') {
				status.grid = shared.parseGrid(status.grid);
				promise = turnCallback(status, config);
			}
			else {
				var joinDefer = q.defer();
				joinDefer.resolve('join');
				promise = joinDefer.promise;
			}
			promise.then(function(cmd) {
				var requestPromise = null;
				if (typeof(cmd) == 'object' && cmd.length) {
					for(var i=0; i<cmd.length; i++) {
						var subCmd = cmd[i];
						if(!requestPromise) {
							requestPromise = request(subCmd);
						}
						else {
							requestPromise = requestPromise.then((function(subCmd){
								return function(newStatus) {
									if(newStatus.status == 'running') {
										return request(subCmd);
									}
									else {
										return newStatus;
									}
								};
							})(subCmd));
						}
					}
				}
				else {
					requestPromise = request(cmd);					
				}
				return requestPromise;	
			}).then(function(status) {
				events.emit('taketurn', status);
			}).catch(function(error) {
				console.log('ERROR', error);
				defer.reject(error);
			})
		}
		else {
			defer.resolve(status.status);
		}
	});

	defer.promise.then(function(status) {
		console.log('GAME OVER:', status.toUpperCase());
	}).catch(function(error) {
		console.log('FATAL ERROR:', error);
	});
	
	events.emit('taketurn', {});

	return defer.promise;
}

exports.start = start;
exports.getConfig = getConfig;
