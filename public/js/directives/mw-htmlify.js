var mwHtmlify = angular.module("mw-htmlify", []);

mwHtmlify.directive("mwHtmlify", function ($compile){
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
		restrict: "A",
		link: function(scope, element, attrs){
			if (! scope.mwHtmlify){
				scope.mwHtmlify = function(id, str){
					angular.element(".mw-htmlify-text-" + id).html(htmlifyLinks(str));
				};
			}
			id += 1;
			var text = element.text();
			text = "{{mwHtmlify(" + id + ", " + text.replace(/\{/g, "").replace(/\}/g, "") + ")}}";
			element.text(text);
			element.addClass("mw-htmlify-text-" + id);
			element.removeAttr("mw-htmlify");
			var cmp = $compile(element);
			cmp(scope);
		}
	};
});