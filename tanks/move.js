var q = require('Q');

module.exports = function(status, config){
	var defer = q.defer();
	defer.resolve('move');
	return defer.promise;		
};
