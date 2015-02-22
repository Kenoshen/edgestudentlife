var app = angular.module("edgeApp");

app.controller("ContactCtrl", function($scope, $rootScope, $location, $route, email) {
  console.log("Contact: " + $location.path());
  $scope.message = {name: "", email: "", phone: "", body: ""};
  $scope.sendEmail = function(isValid){
    $scope.submitted = true;
    if (isValid){
      $rootScope.loadAnimation = true;
      email.sendEmail($scope.message, function(data){
        console.log("Email sent");
        $rootScope.loadAnimation = false;
        $scope.message = {name: "", email: "", phone: "", body: ""};
        alert("Thank you! Your message has sent.");
        $route.reload();
      }, function(data){
        console.log("Failure: " + JSON.stringify(data));
        $rootScope.loadAnimation = false;
        alert("Something went wrong, please try again.");
      });
    } else {
    }
  };
});