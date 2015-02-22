var app = angular.module("edgeApp");

app.controller("CalendarCtrl", function($scope, $rootScope, $location, $compile, timestamp) {
  console.log("Calendar: " + $location.path());
  $scope.getEvents = function(month, year, callback){
    $rootScope.getGoogleEventsForMonthYear(month, year, function(month, year, data){
      var events = [];
      for (var i = 0; i < data.length; i++){
        var evt = {data: data[i]};
        evt.date = timestamp.normalize.google.toDate(evt.data.start);
        events.push(evt);
      }
      callback(events);
    });
  };
  $scope.displayEvent = function(entry){
    var elem = $(document.createElement("a"));
    if (entry.date.allday){
      elem.text(entry.data.title).attr({
        'ng-href': "#/events/" + entry.data.id
      });
    } else {
      elem.text(timestamp.format(entry.date, "h:mma ") + entry.data.title).attr({
        'ng-href': "#/events/" + entry.data.id
      });
    }
    var e = $compile(elem);
    e($scope);
    return elem;
  };
});