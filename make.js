#!/usr/bin/node

var OEmbedRegistry = require("./oembedregistry.js").OEmbedRegistry;
var fs = require('fs');

var infile     = process.argv[2] || "./endpoints.json";
var regexpfile = process.argv[3] || "./endpoints-regexp.json";
var simplefile = process.argv[4] || "./endpoints-simple.json";

fs.readFile(infile, "utf8", function (err, data) {
	if (err) throw err;
	var endpoints = JSON.parse(data);
	var reg = new OEmbedRegistry(endpoints);
	var endpoints_regexp = {};
	var endpoints_simple = {};
	// regexp version:
	for (var endpoint in reg.endpoints) {
		endpoints_regexp[endpoint] = reg.endpoints[endpoint].map(function (regexp) {
			var s = String(regexp);
			return s.slice(1,s.length-1);
		});
	}
	// simple pattern version:
	for (var endpoint in endpoints) {
		// the simple version only supports endpoints that don't reference match groups
		if (/\{\d+\}/.test(endpoint)) {
			console.log("excluding endpoint from "+simplefile+": "+endpoint);
		}
		else {
			var patterns = endpoints[endpoint];
			var simple_patterns = endpoints_simple[endpoint] = [];
			for (var i = 0; i < patterns.length; ++ i) {
				var pattern = patterns[i].replace(/\{[^\{\}]+\}/g,'*').replace(/[\(\)]/g, '').replace(/\*{2,}/g,'*');
				var brackets = /[\[\]]/g;
				var index = 0;
				var parsed = [];
				var stack = [];
				var match;

				// parse pattern for optional sections:
				while ((match = brackets.exec(pattern))) {
					if (match.index > index) {
						parsed.push(pattern.slice(index,match.index));
					}

					if (match[0] === '[') {
						var optional = [];
						stack.push(parsed);
						parsed.push(optional);
						parsed = optional;
					}
					else if (stack.length === 0) {
						throw new SyntaxError("unexpected ']' in pattern: "+JSON.stringify(pattern));
					}
					else {
						parsed = stack.pop();
					}

					index = match.index+1;
				}
				if (stack.length !== 0) {
					throw new SyntaxError("missing ']' in pattern: "+JSON.stringify(pattern));
				}
				if (index < pattern.length) {
					parsed.push(pattern.slice(index));
				}
				// generate multiple urls for optional sections:
				simple_patterns.push.apply(simple_patterns,expandOptional(parsed));
			}
		}
	}
	fs.writeFile(regexpfile, JSON.stringify(endpoints_regexp, null, 4), function (err) {
		if (err) throw err;
		console.log("written "+regexpfile);
	});

	fs.writeFile(simplefile, JSON.stringify(endpoints_simple, null, 4), function (err) {
		if (err) throw err;
		console.log("written "+simplefile);
	});
});

// generate multiple urls for optional sections
// @param [Array] pattern
function expandOptional (pattern) {
	var expanded = [[]];

	for (var i = 0; i < pattern.length; ++ i) {
		var part = pattern[i];
		if (Array.isArray(part)) {
			var newExpanded = [];
			expandOptional(part).forEach(function (part) {
				expanded.forEach(function (buf) {
					newExpanded.push(buf.slice());
					buf.push(part);
					newExpanded.push(buf);
				});
			});
			expanded = newExpanded;
		}
		else {
			expanded.forEach(function (buf) { buf.push(part); });
		}
	}

	return expanded.map(function (buf) { return buf.join(''); });
}
