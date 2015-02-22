var ma = angular.module("map", []);

ma.factory("map", function ($http){
	return {
		getMapSource: function(where, success, failure){
			$http.get("/google/map?where=" + where).success(success).error(failure);
		}
	};
});