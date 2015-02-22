var fe = angular.module("feed", []);

fe.factory("feed", function ($http){
	return {
		getGoogleFeed: function(size, success, failure){
			$http.get("/google/newsfeed?size=" + size).success(success).error(failure);
		},
		getFacebookFeed: function(size, success, failure){
			$http.get("/facebook/newsfeed?size=" + size).success(success).error(failure);
		},
		getTwitterFeed: function(size, success, failure){
			$http.get("/twitter/newsfeed?size=" + size).success(success).error(failure);
		}
	};
});