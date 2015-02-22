var co = angular.module("contacts", []);

co.factory("contacts", function ($http){
	return {
		addContact: function(contact, success, failure){
			$http.post("/google/contacts", contact).success(success).error(failure);
		}
	};
});