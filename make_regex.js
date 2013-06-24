#!/usr/bin/node

var OEmbedRegistry = require("./oembedregistry.js").OEmbedRegistry;
var fs = require('fs');

fs.readFile("./endpoints.json", "utf8", function (err, data) {
	if (err) throw err;
	var reg = new OEmbedRegistry(JSON.parse(data));
	data = {};
	for (var endpoint in reg.endpoints) {
		data[endpoint] = reg.endpoints[endpoint].map(function (regexp) {
			var s = String(regexp);
			return s.slice(1,s.length-1);
		});
	}
	fs.writeFile("./endpoints-regexp.json", JSON.stringify(data, null, 4), function (err) {
		if (err) throw err;
		console.log("written endpoints-regexp.json");
	});
});
