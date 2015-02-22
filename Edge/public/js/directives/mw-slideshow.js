var mwSS = angular.module("mw-slideshow", []);

mwSS.directive("mwSlideshow", function ($timeout){
	var id = 0;
	htmlifyLinks = function(str){
		if (str){
			var start = 0;
			while(str.indexOf("http://", start) >= 0 || str.indexOf("https://", start) >= 0){
				var http = str.indexOf("http://", start);
				var https = str.indexOf("https://", start);
				start = (http < 0 ? https : (https < 0 ? http : (http < https ? http : https)));
				var end = str.indexOf(" ", start);
				if (end === -1){
					end = str.length;
				}
				var link = str.slice(start, end);
				var htmlLink = "<a href='" + link + "' target='_blank'>" + link + "</a>";
				str = str.replace(link, htmlLink);
				start = start + htmlLink.length;
			}
		}
		return str;
	};
	return {
		link: function(scope, element, attrs){
			scope["mwActiveSlide"] = 0;
			scope.$watch(attrs.mwSlides, function(value){
				var slides = value;
				if (slides && slides.length > 0)
				{
					element.empty();
					var container = angular.element(document.createElement("div")).attr({
						id: "slide-container",
						style: "position: relative; width: 100%; height: 100%;"
					});
					element.append(container);
					for (var i = 0; i < slides.length; i++){
						var img = angular.element(document.createElement("img")).attr({
							src: slides[i].src,
							id: "slide-" + i
						}).addClass("slide").css("position", "absolute").css("top", 0);
						if (container.width() > container.height()){
							img.css("height", "100%");
						} else {
							img.css("width", "100%");
						}
						if (i === 0){
							img.addClass("activeSlide");
						}
						container.append(img);
						slides[i].img = img;
						if (slides[i].cap){
							var cap = angular.element(document.createElement("div")).attr({
								id: "caption-" + i
							}).addClass("caption").text(slides[i].cap).css("position", "absolute").css("bottom", 0).css("margin-left", "auto").css("margin-right", "auto");
							container.append(cap);
							slides[i].caption = cap;
							if (i === 0){
								cap.addClass("activeSlide");
							}
						}
					}
				}
			});
			scope.$watch("mwActiveSlide", function(value){
				var slides = scope[attrs.mwSlides];
				if (slides && slides.length > 0){
					var index = value % slides.length;
					for (var i = 0; i < slides.length; i++){
						var slide = slides[i];
						if (slide.img){
							if (i === index){
								slide.img.addClass("activeSlide");
							} else {
								slide.img.removeClass("activeSlide");
							}
						}
						if (slide.cap){
							if (i === index){
								slide.caption.addClass("activeSlide");
							} else {
								slide.caption.removeClass("activeSlide");
							}
						}
					}
				}
			});
			function incrementActiveSlide(){
				scope["mwActiveSlide"] += 1;
				$timeout(incrementActiveSlide, parseInt(attrs.mwTimeout));
			};
			$timeout(incrementActiveSlide, parseInt(attrs.mwTimeout));
		}
	};
});