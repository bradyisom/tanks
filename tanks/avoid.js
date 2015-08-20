var q = require('Q');
var _ = require('lodash');

module.exports = function(state){
	var defer = q.defer();
	var commands = [];

	// var closestLaser = state.closestCoords('L');
	// var closestObj = null;
	// if(closestLaser.m == -1) {
	// 	closestObj = state.otherCoords;
	// }
	// else {
	// 	closestObj = closestLaser;
	// }
	var closestObj = state.closestCoords('L');

	// console.log('dist', state.dist(state.myCoords.m, state.myCoords.n, closestObj.m, closestObj.n));
	if(closestObj.m != -1 && closestObj.n != -1 &&
		state.dist(state.myCoords.m, state.myCoords.n, closestObj.m, closestObj.n) < 4) {

		var new_m = -1;
		var new_n = -1;
		if(state.myCoords.m == closestObj.m) {
			if(state.getObj(state.myCoords.m+1, state.myCoords.n) == '_') {
				new_m = state.myCoords.m+1;
				new_n = state.myCoords.n;
			}
			else if(state.getObj(state.myCoords.m-1, state.myCoords.n) == '_') {
				new_m = state.myCoords.m-1;
				new_n = state.myCoords.n;
			}
			// if(state.status.orientation == 'north') {
			// 	if(state.getObj(state.myCoords.m-1, state.myCoords.n) == '_') {
			// 		new_m = state.myCoords.m-1;
			// 		new_n = state.myCoords.n;
			// 	}
			// 	else if(state.getObj(state.myCoords.m+1, state.myCoords.n) == '_') {
			// 		new_m = state.myCoords.m+1;
			// 		new_n = state.myCoords.n;
			// 	}
			// }
			// else {
			// 	if(state.getObj(state.myCoords.m+1, state.myCoords.n) == '_') {
			// 		new_m = state.myCoords.m+1;
			// 		new_n = state.myCoords.n;
			// 	}
			// 	else if(state.getObj(state.myCoords.m-1, state.myCoords.n) == '_') {
			// 		new_m = state.myCoords.m-1;
			// 		new_n = state.myCoords.n;
			// 	}
			// }
		}
		else if(state.myCoords.n == closestObj.n) {
			if(state.getObj(state.myCoords.m, state.myCoords.n+1) == '_') {
				new_m = state.myCoords.m;
				new_n = state.myCoords.n+1;
			}
			else if(state.getObj(state.myCoords.m, state.myCoords.n-1) == '_') {
				new_m = state.myCoords.m;
				new_n = state.myCoords.n-1;
			}
			// if(state.status.orientation == 'west') {
			// 	if(state.getObj(state.myCoords.m, state.myCoords.n-1) == '_') {
			// 		new_m = state.myCoords.m;
			// 		new_n = state.myCoords.n-1;
			// 	}
			// 	else if(state.getObj(state.myCoords.m, state.myCoords.n+1) == '_') {
			// 		new_m = state.myCoords.m;
			// 		new_n = state.myCoords.n+1;
			// 	}
			// }
			// else {
			// 	if(state.getObj(state.myCoords.m, state.myCoords.n+1) == '_') {
			// 		new_m = state.myCoords.m;
			// 		new_n = state.myCoords.n+1;
			// 	}
			// 	else if(state.getObj(state.myCoords.m, state.myCoords.n-1) == '_') {
			// 		new_m = state.myCoords.m;
			// 		new_n = state.myCoords.n-1;
			// 	}
			// }
		}

		if(new_m != -1 && new_n != -1) {
			commands.push(state.moveTowards(new_m, new_n));
		}
	}

	commands = _.flatten(commands);
	if(!commands.length) {
		commands = ['noop'];
	}

	defer.resolve(commands);
	return defer.promise;		
};
