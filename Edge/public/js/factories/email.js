var em = angular.module("email", []);

em.factory("email", function ($http){
	return {
		sendEmail: function(message, success, failure){
			$http.post("/google/email", message).success(success).error(failure);
		}
	};
});