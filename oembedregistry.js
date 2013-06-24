var OEmbedRegistry = (function (undefined) {
	"use strict";

	var NamedPatterns = {
		protocol: "[-+\\w]*",
		domain:   "[-\\w]+",
		any:      ".+",
		path:     "[^#?]+",
		path_component: "[^#?/]+",
		query:    "\\?[^#]+",
		anchor:   "#.+"
	};

	function OEmbedRegistry (endpoints) {
		this.endpoints = {};

		// compile patterns
		for (var endpoint in endpoints) {
			var patterns = endpoints[endpoint];
			var regexps = [];
			for (var i = 0; i < patterns.length; ++ i) {
				var match = /^([^:]*:(?:\/\/)?)([^\/]*)(\/.*?)(\*[\(\)\[\]]*)?$/.exec(patterns[i]);

				if (!match) {
					throw new SyntaxError("illegal pattern: "+JSON.stringify(patterns[i]));
				}

				var stack = [];
				var compiled = [
					"^",
					convert(match[1], NamedPatterns.protocol),
					convert(match[2], NamedPatterns.domain),
					convert(match[3], NamedPatterns.path_component)
				];

				if (match[4]) {
					compiled.push(convert(match[4], NamedPatterns.any));
				}

				if (stack.length > 0) {
					throw new StyntaxError("unexpected end of pattern, expected: '"+(stack[stack.length-1])+"' at the end of "+JSON.stringify(patterns[i]));
				}
				
				compiled.push("$");

				regexps.push(new RegExp(compiled.join("")));
			}
			this.endpoints[endpoint] = regexps;
		}
		
		// convert URL pattern to regular expression
		function convert (pattern, defaultRegExp) {
			return pattern.replace(/(\*)|(?:{([^{}]*)})|([\[\]\(\)])|([-\/\{\}\*\+\?\.\\\^\$\|])/g, function (all, star, name, group, esc) {
				if (star) {
					return defaultRegExp;
				}
				else if (group) {
					switch (group) {
						case "(":
							stack.push(")");
							return "(";
						case ")":
							if (stack.pop() !== ")") {
								throw new SyntaxError("unexpected ')' in "+JSON.stringify(patterns[i]));
							}
							return ")";
						case "[":
							stack.push("]");
							return "(?:";
						case "]":
							if (stack.pop() !== "]") {
								throw new SyntaxError("unexpected ']' in "+JSON.stringify(patterns[i]));
							}
							return ")?";
					}
				}
				else if (name) {
					var key = name.toLowerCase().replace(/-/g,'_');
					if (key in NamedPatterns) {
						return NamedPatterns[key];
					}
					throw new SyntaxError("illegal named pattern '"+name+"' in "+JSON.stringify(patterns[i]));
				}
				else {
					return "\\"+esc;
				}
			});
		}
	}

	OEmbedRegistry.prototype = {
		// find matching provider and return expanded endpoint URL
		match: function (url, options) {
			var defaultOptions = {format: 'json', url: url};
			if (options) {
				var o = options;
				options = defaultOptions;
				for (var param in o) {
					options[param] = String(o[param]);
				}
			}
			else {
				options = defaultOptions;
			}
			for (var endpoint in this.endpoints) {
				var regexps = this.endpoints[endpoint];
				for (var i = 0; i < regexps.length; ++ i) {
					var match = regexps[i].exec(url);
					if (match) {
						// expand patterns
						var expanded = {};
						var query = endpoint.replace(/{(\d+)}|{([^{}]+)}/g, function (all, index, name) {
							if (index) {
								return match[index];
							}
							else if (name in options) {
								expanded[name] = true;
								return options[name];
							}
							else {
								// maybe throw exception in this case?
								return all;
							}
						});

						// determine if there is any parameter that is not expended and
						// gather them for the query string
						var missing = [];
						for (var param in options) {
							if (!expanded[param]) {
								missing.push(encodeURIComponent(param)+"="+encodeURIComponent(options[param]));
							}
						}

						// add missing params as query string
						if (missing.length > 0) {
							query += "?"+missing.join("&");
						}

						return query;
					}
				}
			}
			return null;
		}
	};

	return OEmbedRegistry;
})();

if (typeof exports === "object") {
	exports.OEmbedRegistry = OEmbedRegistry;
}
