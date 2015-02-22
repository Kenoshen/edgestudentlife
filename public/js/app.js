var app = angular.module("edgeApp", [
    "ngRoute", 
    "timestamp", 
    "feed", 
    "photos", 
    "events", 
    "contacts", 
    "email", 
    "map", 
    "mw-calendar", 
    "mw-htmlify",
    "mw-slideshow"
  ]);

app.config(function($routeProvider, $sceDelegateProvider) {

  $routeProvider.when('/events', {
    templateUrl : 'html/events.html'
  }).when('/events/:id', {
    templateUrl : 'html/event.html'
  }).when('/calendar', {
    templateUrl : 'html/calendar.html'
  }).when('/about', {
    templateUrl : 'html/about.html'
  }).when('/contact', {
    templateUrl : 'html/contact.html'
  }).when('/ciy2014', {
    templateUrl : 'html/ciy2014.html'
  }).when('/store', {
    templateUrl : 'html/store.html'
  }).when('/home', {
    templateUrl : 'html/home.html'
  }).when('/event/receipt/good', {
    templateUrl : 'html/receipt-good.html'
  }).when('/event/receipt/decline', {
    templateUrl : 'html/receipt-decline.html'
  }).when('/event/receipt/error', {
    templateUrl : 'html/receipt-error.html'
  }).otherwise({
    templateUrl : 'html/home.html'
  });

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://www.google.com/**'
  ]);
});