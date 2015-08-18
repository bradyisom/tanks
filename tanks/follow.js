var q = require('Q');
var _ = require('lodash');

var State = require('../shared').State;

module.exports = function(state){
	var defer = q.defer();

	try{
		var commands = [];
		commands = state.moveTowards(state.otherCoords.m, state.otherCoords.n, 'LW', true);

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
