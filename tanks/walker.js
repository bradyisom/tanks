var q = require('Q');
var _ = require('lodash');

module.exports = function(state){
	var defer = q.defer();
	var rand = function(min, max) {
		min = min || 1;
		max = max || 100;
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	var commands = [];
	var num = rand();

	var next = state.getNextObj();
	if(next != '_') {
		if(num % 2) {
			commands.push('right');
		}
		else {
			commands.push('left');
		}
	}
	else {
		if(num < 10) {
			commands.push('right');
		}
		else if (num > 90) {
			commands.push('left');
		}
		else {
			commands.push('move');
		}
	}

	commands = _.flatten(commands);
	if(!commands.length) {
		commands = ['noop'];
	}

	defer.resolve(commands);
	return defer.promise;		
};
