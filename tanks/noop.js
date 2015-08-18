var q = require('Q');

module.exports = function(state){
	var defer = q.defer();
	defer.resolve('noop');
	return defer.promise;		
};
