var app = angular.module("edgeApp");

app.controller("StoreCtrl", function($scope, $rootScope, $location) {
  console.log("Store: " + $location.path());
});