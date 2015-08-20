var q = require('Q');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');

// var battery = require('./battery');
// var fire = require('./fire');
// var circle = require('./circle');
// var noop = require('./noop');

var tanks = {};

var normalizedPath = path.join(__dirname, ".");
fs.readdirSync(normalizedPath).forEach(function(file) {
	if(file != 'combo.js') {
		tanks[path.parse(file).name] = require("./" + file);
	}
});

var usageCounts = {total:0};

module.exports = function(state){
	var promise = null;
	var algorithm = null;
	var algorithmInfo = '';
	var algorithms = [{
		name: 'fire',
		condition: function() {
			return state.status.energy > state.config.laser_energy;
		}
	},{
		name: 'avoid'
	},{
		name: 'battery',
		condition: function() {
			return (state.status.energy < (state.config.max_energy*0.5) ||
					state.status.health < (state.config.max_health*0.5));
		}
	},{
		name: 'follow',
		condition: function() {
			return state.status.energy > state.config.laser_energy;
		}
		// TODO: add run away algorithm
	},{
		name: 'walker'
	},{
		name: 'circle'
	},{
		name: 'noop'
	}];

	// console.log('tanks', tanks);

	var popAlgorithm = function() {
		algorithmInfo = algorithms.shift();
		algorithm = tanks[algorithmInfo.name];
		// console.log('trying algorithm', algorithmInfo);
	}

	var afterAlgorithm = function(commands) {
		commands = _.without(commands, 'noop');
		// console.log('commands', commands);
		if (commands.length) {
			// console.log(algorithmInfo);
			usageCounts[algorithmInfo.name] = usageCounts[algorithmInfo.name] || 0;
			usageCounts[algorithmInfo.name]++;
			usageCounts.total++;
			// console.log('usageCounts', usageCounts);
			return commands;
		}
		else if (algorithms.length) {
			popAlgorithm();
			while(algorithmInfo.condition && !algorithmInfo.condition()) {
				popAlgorithm();
			}
			return algorithm(state).then(afterAlgorithm);
		}
		else {
			return ['noop'];
		}
	};

	popAlgorithm();
	promise = algorithm(state).then(afterAlgorithm);

	return promise;
};
