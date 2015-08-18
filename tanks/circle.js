var q = require('Q');
var _ = require('lodash');

module.exports = function(state){
	var defer = q.defer();
	var rand = function() {return Math.floor(Math.random() * 100);};
	var commands = ['right'];

	// if(rand() % 4) {
	// 	commands.push('fire');
	// }

	if(rand() % 2) {
		commands.push('move');
		commands.push('move');
	}

	defer.resolve(_.flatten(commands));
	return defer.promise;		
};
