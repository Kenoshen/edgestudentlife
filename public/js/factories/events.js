var ev = angular.module("events", []);

ev.factory("events", function ($http){
	return {
		getEvents: function(month, year, success, failure){
			$http.get("/google/events?month=" + month + "&year=" + year).success(success).error(failure);
		},
		byId: function(id, success, failure){
			$http.get("/google/events/" + id).success(success).error(failure);
		}, 
		addAttendee: function(id, attendee, success, failure){
			$http.put("/google/events/" + id + "/attendees", attendee).success(success).error(failure);
		}
	};
});