module.exports = function (){
	var Client = require('node-rest-client').Client;
	client = new Client();
	//
	var auth = require('facebook-auth');
	var api = {
		getNewsfeed: function(size, callback){
			var args = {
				path: {
					userId: auth.userId,
					accessToken: auth.accessToken,
					limit: (size ? size : auth.defaultFeedSize)
				}
			};
			client.get(auth.feedUrl, args, function(data, response){
				try{
					data = JSON.parse(data);
				}catch (err){
					callback(data);
				}
				callback(data.data);
			});
		},
		getPhotos: function(albumId, size, isHd, callback){
			var imageHeight = (isHd === "true" ? auth.hd : auth.sd);
			var args = {
				path: {
					albumId: (albumId ? albumId : auth.defaultAlbumId),
					limit: (size ? size : auth.defaultPhotoSize)
				},
				parameters: {
					height: 300
				}
			};
			client.get(auth.photoUrl, args, function(data, response){
				try{
					data = JSON.parse(data);
				}catch (err){
					callback(data);
				}
				imgs = [];
				try {
					for (var i = 0; i < data.data.length; i++){
						var img = {};
						var image = data.data[i];
						img.id = image.id;
						img.name = image.name;
						if (image.images){
							for (var k = 0; k < image.images.length; k++){
								var photo = image.images[k];
								if (photo.height >= imageHeight.min && photo.height <= imageHeight.max){
									img.img = photo.source;
									break;
								}
							}
							if (! img.img && image.images.length > 0){
								img.img = image.images[0].source;
							}
						}
						imgs.push(img);
					}
				} catch (e){}
				callback(imgs);
			});
		}
	};
	return function(req, res, next){
		var method = req.method;
		var path = req.path;
		if (method === "GET"){
			if (path.search("^/newsfeed$") >= 0){
				console.log("get facebook feed");
				var size = null;
				if (req.query.size){
					size = parseInt(req.query.size, 10);
				}
				api.getNewsfeed(size, function(data){
					res.send(data);
				});
			} else if (path.search("^/photos$") >= 0){
				console.log("get facebook photos");
				var id = null;
				if (req.query.id){
					id = req.query.id;
				}
				var size = null;
				if (req.query.size){
					size = parseInt(req.query.size, 10);
				}
				var isHd = null;
				if (req.query.hd){
					isHd = req.query.hd;
				}
				api.getPhotos(id, size, isHd, function(data){
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