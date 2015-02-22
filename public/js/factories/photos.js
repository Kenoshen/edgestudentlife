var ph = angular.module("photos", []);

ph.factory("photos", function ($http){
	return {
		getPhotos: function(size, isHd, success, failure){
			$http.get("/facebook/photos?size=" + size + "&hd=" + isHd).success(success).error(failure);
		}
	};
});