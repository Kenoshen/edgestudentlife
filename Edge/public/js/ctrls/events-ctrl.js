var app = angular.module("edgeApp");

app.controller("EventsCtrl", function($scope, $rootScope, $location, timestamp) {
  console.log("Events: " + $location.path());
  $scope.upcommingMonths = [];
  var d = new Date();
  var thisMonth = d.getUTCMonth() + 1;
  var thisYear = d.getUTCFullYear();
  var recursiveEventGetter = function(month, year, data){
    if (data){
        $scope.upcommingMonths.push({
          name: timestamp.monthToLongString(month), 
          month: month, 
          year: year,
          events: data
        });
    }
    if (timestamp.monthDifference(thisMonth, thisYear, month, year) < 2){
      $rootScope.getGoogleEventsForMonthYear(month + 1, year, recursiveEventGetter);
    }
  };
  recursiveEventGetter(thisMonth - 1, thisYear, null)
});