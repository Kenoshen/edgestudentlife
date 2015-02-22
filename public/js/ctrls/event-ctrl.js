var app = angular.module("edgeApp");

app.controller("EventCtrl", function($scope, $rootScope, $location, map, events, contacts, timestamp) {
	console.log("Event: " + $location.path());
	//$rootScope.goToAnchor("tabs");
	$scope.format = function(date, format, formatAllday){
		if (! date || ! format || ! formatAllday){
			return null;
		}
		date = timestamp.normalize.google.toDate(date);
		if (date.allday){
			return timestamp.format(date, formatAllday);
		} else {
			return timestamp.format(date, format);
		}
	};
	$scope.getEventData = function(id){
		$rootScope.getGoogleEventById(id, function(id, data){
			$scope.event = data;
			if ($scope.event.where){
				$rootScope.loadAnimation = true;
				map.getMapSource($scope.event.where, function(data){
					$rootScope.loadAnimation = false;
					$scope.eventMapSource = data.src;
				}, function(data){
					console.log("Error: " + data);
					$rootScope.loadAnimation = false;
				});
			}
		});
	};
	$scope.signUpForEvent = function(){
		console.log("Signup");
		if ($scope.signup.name && $scope.signup.email){
			$rootScope.loadAnimation = true;
			contacts.addContact({
				name: $scope.signup.name,
				emails: [{
					type: $scope.signup.emailType,
					address: $scope.signup.email,
					primary: true
				}],
				phoneNumbers: ($scope.signup.phone ? [{type: $scope.signup.phoneType, number: $scope.signup.phone}] : [])
			}, function(data){
				events.addAttendee($scope.event.id, {
					displayName: $scope.signup.name,
					email: $scope.signup.email,
					responseStatus: "accepted"
				}, function(data){
					$scope.signup = {name: "", email: "", emailType: "home", phone: "", phoneType: "mobile"};
					$rootScope.events.byId[$scope.event.id] = undefined;
					$rootScope.loadAnimation = false;
					$scope.getEventData($scope.event.id);
				}, function(data){
					console.log("Error: " + data);
					$rootScope.loadAnimation = false;
				});
			}, function(data){
				console.log("Error: " + data);
				$rootScope.loadAnimation = false;
			});
		}
	};
	$scope.atLeastOneAttendee = function(){
		if ($scope.event && $scope.event.attendees){
			for (var i = 0; i < $scope.event.attendees.length; i++){
				if ($scope.event.attendees[i].responseStatus === "accepted" && $scope.event.attendees[i].displayName){
					return true;
				}
			}
		}
		return false;
	};
	$scope.getEventData($location.path().substring("/events/".length));
	$scope.signup = {name: "", email: "", emailType: "home", phone: "", phoneType: "mobile"};
});