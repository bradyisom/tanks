var q = require('Q');
var _ = require('lodash');

var server = require('../server');
var shared = require('../shared');

module.exports = function(status, config){
	var defer = q.defer();

	var myCoords = shared.coords(status.grid, 'X');
	var otherCoords = shared.coords(status.grid, 'O');
	var config = server.getConfig();

	var commands = [];
	if(status.energy > config.laser_energy) {
		if (otherCoords.m == myCoords.m) {
			if (otherCoords.n < myCoords.n) {
				commands.push(shared.faceLeft(status.orientation));
				commands.push('fire');
			}
			if (otherCoords.n > myCoords.n) {
				commands.push(shared.faceRight(status.orientation));
				commands.push('fire');
			}
		}
		if (otherCoords.n == myCoords.n) {
			if (otherCoords.m < myCoords.m) {
				commands.push(shared.faceUp(status.orientation));
				commands.push('fire');
			}
			if (otherCoords.m > myCoords.m) {
				commands.push(shared.faceDown(status.orientation));
				commands.push('fire');
			}
		}
	}

	if (!commands.length) {
		var batteryCoords = shared.objectCoords(status.grid, 'B', myCoords.m, myCoords.n);
		if (batteryCoords.m != -1) {
			commands = shared.moveTowards(batteryCoords.m, batteryCoords.n, myCoords.m, myCoords.n, status.orientation);
		}
	}

	if (!commands.length){
		commands = shared.moveTowards(otherCoords.m, otherCoords.n, myCoords.m, myCoords.n, status.orientation);
	}

	commands = _.flatten(commands);
	if(!commands.length) {
		commands = ['noop'];
	}
	defer.resolve(commands);

	return defer.promise;		
};
