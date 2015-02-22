module.exports = function (vHost){
	var google = require("./edgeGoogle");
	var facebook = require("./edgeFacebook");
	var twitter = require("./edgeTwitter");

	vHost.use("/google", google());
	vHost.use("/facebook", facebook());
	vHost.use("/twitter", twitter());
};