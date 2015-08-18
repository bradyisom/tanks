var q = require('Q');
var _ = require('lodash');

module.exports = function(state){
	var defer = q.defer();

	var commands = [];
	var obstacle = null;
	if(state.status.energy > state.config.laser_energy) {
		if (state.otherCoords.m == state.myCoords.m) {
			if (state.otherCoords.n < state.myCoords.n) {
				obstacle = state.firstObstacle('left');
				if(!obstacle || obstacle.n <= state.otherCoords.n) {
					commands.push(state.faceLeft());
					commands.push('fire');
				}
			}
			if (state.otherCoords.n > state.myCoords.n) {
				obstacle = state.firstObstacle('right');
				if(!obstacle || obstacle.n >= state.otherCoords.n) {
					commands.push(state.faceRight());
					commands.push('fire');
				}
			}
		}
		if (state.otherCoords.n == state.myCoords.n) {
			if (state.otherCoords.m < state.myCoords.m) {
				obstacle = state.firstObstacle('up');
				if(!obstacle || obstacle.m <= state.otherCoords.m) {
					commands.push(state.faceUp());
					commands.push('fire');
				}
			}
			if (state.otherCoords.m > state.myCoords.m) {
				obstacle = state.firstObstacle('down');
				if(!obstacle || obstacle.m >= state.otherCoords.m) {
					commands.push(state.faceDown());
					commands.push('fire');
				}
			}
		}
	}

	commands = _.flatten(commands);
	if(!commands.length) {
		commands = ['noop'];
	}
	defer.resolve(commands);

	return defer.promise;		
};
