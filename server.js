var argv = require('yargs').argv;
var http = require('http');
var q = require('Q');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var shared = require('./shared');

var serverHost = argv.host || 'localhost';
var serverPort = argv.port || 8080;
var gameName = argv.game || 'yay:screen';
var playerName = argv.player || 'Brady';

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

		// console.log('sending command', cmd);

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


function parseGrid(grid) {
	// console.log('grid', grid);
	var rows = [];
	for(var i=0; i<3; i++) {
		var rowString = grid.trim('\n');
		if(i%2 == 0) {
			rowString = rowString.replace('X', '_');
		}
		rows.push(rowString.split('\n'));
	}
	rows = _.flatten(rows);
	for(var r=0; r<rows.length; r++) {
		var rowString = rows[r];
		rows[r] = rowString.replace('X','_').split('');
		rows[r].push(rowString.split(''));
		rows[r].push(rowString.replace('X','_').split(''));
		rows[r] = _.flatten(rows[r]);
	}
	// console.log('rows');
	// for(var r=0; r<rows.length; r++) {
	// 	console.log(rows[r].join(''));
	// }
	return rows;
}


function start(turnCallback) {
	var defer = q.defer();
	var events = new EventEmitter();
	
	events.on('taketurn', function(status) {
		status = status || {};
		if(!status.status || status.status == 'running') {
			if (status.status == 'running') {
				status.originalGrid = status.grid;
				status.grid = parseGrid(status.grid);
				var state = new shared.State(status, config);
				promise = turnCallback(state);
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
