var q = require('Q');
var _ = require('lodash');

var State = require('../shared').State;

module.exports = function(state){
	var defer = q.defer();

	try{
		var commands = [];
		var batteryCoords = state.closestCoords('B');
		if (batteryCoords.m != -1) {
			commands = state.moveTowards(batteryCoords.m, batteryCoords.n, 'LWO');
		}

		commands = _.flatten(commands);
		if(!commands.length) {
			commands = ['noop'];
		}
		defer.resolve(commands);
	}
	catch(err) {
		console.log(err.stack);
	}

	return defer.promise;		
};
