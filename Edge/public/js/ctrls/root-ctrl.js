  var app = angular.module("edgeApp");

  app.controller("RootCtrl", function($scope, $rootScope, $location, $anchorScroll, events, timestamp) {
    console.log("Root: " + $location.path());
    $rootScope.loadAnimation = false;
    $rootScope.goToAnchor = function(anchor){
      if ($location.hash() !== anchor) {
        // set the $location.hash to `newHash` and
        // $anchorScroll will automatically scroll to it
        $location.hash(anchor);
      } else {
        // call $anchorScroll() explicitly,
        // since $location.hash hasn't changed
        $anchorScroll();
      }
    };
    $rootScope.format = function(date, type, format){
      if (! date || ! format){
        return null;
      }
      if (type === "event"){
        date = timestamp.normalize.google.toDate(date);
      } else if (type === "post"){
        date = timestamp.normalize.facebook.toDate(date);
      } else if (type === "tweet"){
        date = timestamp.normalize.twitter.toDate(date);
      } else if (type){
        return null;
      }
      if (date.allday){
        format = format.substring(0, format.indexOf(" @"));
      }
      return timestamp.format(date, format);
    };
    $rootScope.getGoogleEventsForMonthYear = function(month, year, callback){
      var originalMonth = month;
      var newMonth = originalMonth % 12;
      newMonth += (newMonth <= 0 ? 12 : 0);
      var addYears = (originalMonth > 0 ? parseInt((originalMonth - 1) / 12) : parseInt(originalMonth / 12) - 1);
      //
      month = newMonth;
      year += addYears;
      if ($rootScope.events[year] && $rootScope.events[year][month]){
        callback(month, year, $rootScope.events[year][month]);
      } else {
        $rootScope.loadAnimation = true;
        events.getEvents(month, year, function(data){
          if (! $rootScope.events[year]){
            $rootScope.events[year] = {};
          }
          $rootScope.events[year][month] = data.events;
          for (var i = 0; i < data.events; i++){
            $rootScope.events.byId[data.events[i].id] = data.events[i];
          }
          $rootScope.loadAnimation = false;
          callback(month, year, $rootScope.events[year][month]);
        }, function(data){
          console.log("Error: " + data);
          $rootScope.loadAnimation = false;
          callback(month, year, null);
        });
      }
    };
    $rootScope.getGoogleEventById = function(id, callback){
      if ($rootScope.events.byId[id]){
        callback(id, $rootScope.events.byId[id]);
      } else {
        $rootScope.loadAnimation = true;
        events.byId(id, function(data){
          $rootScope.events.byId[id] = data.event;
          $rootScope.loadAnimation = false;
          callback(id, $rootScope.events.byId[id]);
        }, function(data){
          console.log("Error: " + data);
          $rootScope.loadAnimation = false;
          callback(id, null);
        });
      }
    };
    $rootScope.getGoogleEventFeed = function(callback){
      $rootScope.loadAnimation = true;
      events.newsfeed(10, function(data){
        for (var i = 0; i < data.events.length; i++){
          $rootScope.events.byId[data.events[i].id] = data.events[i];
        }
        $rootScope.loadAnimation = false;
        callback(data.events);
      }, function(data){
        console.log("Error: " + data);
        $rootScope.loadAnimation = false;
        callback(null);
      });
    };
    if(! $rootScope.events){
      $rootScope.events = {byId:{}};
    }
  });