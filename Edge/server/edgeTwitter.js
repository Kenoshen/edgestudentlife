module.exports = function (){
	var Client = require('node-rest-client').Client;
	client = new Client();
	//
	var auth = require('twitter-auth');
	//
	var twitterAPI = require('node-twitter-api');
	var twitter = new twitterAPI({
	    consumerKey: auth.consumerKey,
	    consumerSecret: auth.consumerSecret,
	    callback: auth.redirect
	});
	//
	var api = {
		getNewsfeed: function(size, callback){
			twitter.getTimeline("user", {
				screen_name: auth.username,
				count: (size ? size : auth.defaultFeedSize), 
				trim_user: 1,
				exlude_replies: "true",
				include_entities: "false"
			}, 
			auth.accessToken, 
			auth.accessTokenSecret, 
			function(error, data, response){
				if (error){
					callback(error);
				} else {
					var feed = [];
					for (var i = 0; i < data.length; i++){
						var point = data[i];
						feed.push({
							created_at: point.created_at,
							id: point.id,
							text: point.text
						});
					}
					callback(feed);
				}
			});
		}
	};
	return function(req, res, next){
		var method = req.method;
		var path = req.path;
		if (method === "GET"){
			if (path.search("^/newsfeed$") >= 0){
				console.log("get twitter feed");
				var size = null;
				if (req.query.size){
					size = parseInt(req.query.size, 10);
				}
				api.getNewsfeed(size, function(data){
					res.send(data);
				});
			} else {
				next();
			}
		} else {
			next();
		}
	};
};