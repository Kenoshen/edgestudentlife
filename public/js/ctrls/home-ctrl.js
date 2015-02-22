var app = angular.module("edgeApp");

app.controller("HomeCtrl", function($scope, $rootScope, $location, timestamp, feed, photos) {
	console.log("Home: " + $location.path());
  $scope.insertDataIntoFeed = function(data){
		var added = false;
		for (var i = 0; i < $scope.newsfeed.length; i++){
			if (timestamp.is(data.date).greaterThan($scope.newsfeed[i].date)){
				$rootScope.newsfeed.splice(i, 0, data);
				added = true;
				break;
			}
		}
		if (! added){
			$rootScope.newsfeed.push(data);
		}
	};
	$scope.feedifyGoogleData = function(events){
  	// {date: null, type: "google", data: event};
  	for (var i = 0; i < events.length; i++){
  		var event = events[i];
  		$scope.insertDataIntoFeed({date: timestamp.normalize.google.toComplex(event.updated), type: "event", data: event});
  		$rootScope.events.byId[event.id] = event;
  	}
  };
  $scope.feedifyFacebookData = function(posts){
  	for (var i = 0; i < posts.length; i++){
  		var post = posts[i];
  		$scope.insertDataIntoFeed({date: timestamp.normalize.facebook.toComplex(post.updated_time), type: "post", data: post});
  	}
  };
  $scope.feedifyTwitterData = function(tweets){
  	for (var i = 0; i < tweets.length; i++){
  		var tweet = tweets[i];
  		$scope.insertDataIntoFeed({date: timestamp.normalize.twitter.toComplex(tweet.created_at), type: "tweet", data: tweet});
  	}
  };
  $scope.trimNewsfeed = function(size){
  	if ($rootScope.newsfeed.length > size){
  		var tempArray = [];
  		for (var i = 0; i < size; i++){
  			tempArray.push($rootScope.newsfeed[i]);
  		}
  		$rootScope.newsfeed = tempArray;
  	}
  };
  $scope.getNewsfeed = function(size){
  	$rootScope.newsfeed = [];
  	$rootScope.loadAnimation = true;
  	feed.getGoogleFeed(size, function(data){
  		$scope.feedifyGoogleData(data.events);
  		feed.getFacebookFeed(size, function(data){
  			$scope.feedifyFacebookData(data);
  			feed.getTwitterFeed(size, function(data){
  				$scope.feedifyTwitterData(data);
  				$scope.trimNewsfeed(size);
  				$rootScope.loadAnimation = false;
  			}, function(data){
  				console.log("Error: " + data);
  				$rootScope.loadAnimation = false;
  			});
  		}, function(data){
  			console.log("Error: " + data);
  			$rootScope.loadAnimation = false;
  		});
  	}, function(data){
  		console.log("Error: " + data);
  		$rootScope.loadAnimation = false;
  	});
  };
  $scope.getSlides = function(size, callback){
    $rootScope.loadAnimation = true;
    photos.getPhotos(size, false, function(data){
      $rootScope.loadAnimation = false;
      var tempSlides = [];
      for (var i = 0; i < data.length; i++){
        tempSlides.push({id: data[i].id, src: data[i].img, cap: data[i].name});
      }
      $rootScope.slides = tempSlides;
      if (callback){
        callback();
      }
    }, function(data){
      console.log("Error: " + data);
      $rootScope.loadAnimation = false;
      if (callback){
        callback();
      }
    });
  };
  if (! $rootScope.newsfeed){
    $scope.getSlides(10, function(){
      $scope.getNewsfeed(10);
    });
  }
});