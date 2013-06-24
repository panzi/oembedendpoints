var OEmbedRegistry = (function (undefined) {
	"use strict";

	var NamedPatterns = {
		protocol: "[-+_a-zA-Z0-9]*",
		domain:   "(?:[-_a-zA-Z0-9]+(?:\.[-_a-zA-Z0-9]+)*)",
		any:      ".+",
		path:     "[^#?=&]+",
		path_component: "[^#?=&/]+",
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
				var regexp = patterns[i].replace(/^([^:]*:(?:\/\/)?)([^\/]*)(\/.*?)(\*)?$/, function (all, protocol, domain, path, starAtEnd) {
					var compiled = [
						convert(protocol, NamedPatterns.protocol),
						convert(domain, NamedPatterns.domain),
						convert(path, NamedPatterns.path_component)
					];

					if (starAtEnd) {
						compiled.push(NamedPatterns.any);
					}

					return compiled.join("");
				});
				regexps.push(new RegExp("^"+regexp+"$"));
			}
			this.endpoints[endpoint] = regexps;
		}
	}

	// convert URL pattern to regular expression
	function convert (pattern,defaultRegExp) {
		return pattern.replace(/(\*)|(?:{([^{}]*)})|([\-\[\]\/\{\}\*\+\?\.\\\^\$\|])/g, function (all, star, name, esc) {
			if (star) {
				return defaultRegExp;
			}
			else if (name) {
				var key = name.toLowerCase().replace(/-/g,'_');
				if (key in NamedPatterns) {
					return NamedPatterns[key];
				}
				throw new SyntaxError("illegal named pattern: "+name);
			}
			else {
				return "\\"+esc;
			}
		});
	}

	OEmbedRegistry.prototype = {
		// find matching provider and return expanded endpoint URL
		match: function (url, options) {
			var defaultOptions = {format: 'json', url: url, callback: 'callback'};
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
