OEmbed Endpoints
================

This is a simple file based registry of know [oembed](http://oembed.com/) endpoints.
If you know endpoints that aren't listed here please fork this project, add the endpoints
and send me a pull request.

This registry does not contain oembed proxies like [embed.ly](http://embed.ly) or
endpoints that need some kind of API key like [wordpress.com](http://wordpress.com/).
The completness of the supported URL patterns for each endpoint is not guaranteed.

File format
-----------

```json
{
	"ENDPOINT-URL": [
		"URL-PATTERN-1",
		"URL-PATTERN-2",
		...
	],
	...
}
```

### Endpoint Placeholders

The endpoint URL may contain several patterns.

There are named patterns that refernece standard oembed parameters: `{format}`, `{url}`,
`{maxwidth}`, `{maxheight}`, `{callback}`. `{callback}` is not strictly standard but it's
commonly used if the endpoint supports JSONP. Currently only `{format}` is used in
`endpoints.json`.

And then there are patterns that reference match groups in the URL patterns, e.g. `{1}`
for the first matched group, `{2}` for the second etc.

### Pattern Syntax

There are several named patterns:

`{protocol}` is any valid protocol, without `:` 
`{domain}` is any valid domain name 
`{path}` is any URI path string (no query string or anchor) 
`{path-component}` is any URI path string that does not contain `/` 
`{query}` is any query string, starting with `?` 
`{anchor}` is any anchor, starting with `#` 
`{any}` any non-zero length string 

The only named pattern currently used in `endpoints.json` is `{path-component}`.

The meaning of the `*` placeholder depends on where it occurs. In the protocol part
of an URL it expands to `{protocol}`, in the hsotname part it expands to `{domain}`
in the rest it expands to `{path-component}` unless if it is at the very end. Then
it expands to `{any}`.

You can define a match group by enclosing a part of the URL pattern by parenthesis `(...)`.
This can be used to reference the matched string in the endpoint URL.

If you wonder why I didn't just use regular expressions is because the regular expression
syntax is different in every programming language. However, this pattern language should
be easy to convert to regular expressions. See an example of how this can be done in
`oembedregistry.js`.

Sources
-------

Sources used to compile this list where amongst others (I'm still working through this sources):

 * [oohEmbed](http://oohembed.com): [endpoints.json](https://code.google.com/p/oohembed/source/browse/app/provider/endpoints.json)
 * [embedr](https://github.com/agoragames/oembedr): [providers.rb](https://github.com/agoragames/oembedr/blob/master/lib/oembedr/providers.rb)
 * [iframely](https://github.com/itteco/iframely): [providers.json](https://github.com/itteco/iframely/blob/master/providers.json)
 * [embed.ly](http://embed.ly): [services](http://api.embed.ly/1/services)

License
-------

The file `endpoints.json` is in the public domain.
