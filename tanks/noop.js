var q = require('Q');

module.exports = function(status, config){
	var defer = q.defer();
	defer.resolve('noop');
	return defer.promise;		
};
