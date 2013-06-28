oEmbed Endpoints
================

This is a simple file based registry of know [oEmbed](http://oembed.com/) endpoints.
If you know endpoints that aren't listed here please fork this project, add the endpoints
and send me a pull request.

### endpoints.json

This file lists all oEmbed endpoints I could find. It does not contain oEmbed proxies
like [embed.ly](http://embed.ly) or endpoints that need some kind of API key like
[wordpress.com](http://wordpress.com/). The completness of this list, the supported URL
patterns for each endpoint or whether the endpoints actually work is not guaranteed.

### endpoints-regexp.json

This file contains the same data as `endpoints.json`, but the URL patterns are converted
to JavaScript compatible regular expressions. It is auto-generated with `make.js`.

### endpoints-simple.json

This file contains mostly the same data as `endpoints.json`, but the URL patterns are
converted to the URL pattern syntax specified on [oembed.com](http://oembed.com/). Because
there is no way to reference certain proportions of the matched URL in this syntax it
does not contain the endpoints that require this. It is auto-generated with `make.js`.

### broken-endpoints.json

The endpoints listed in this file return broken responses.
[http://www.schooltube.com/oembed.json](http://www.schooltube.com/) returns JSON that does
not parse and [on.aol.com](http://on.aol.com/api) sets every field to `null` or `0`.
[http://video.pbs.org/oembed/](http://video.pbs.org/oembed/) is announced in the page
source but doesn't actually work. It returns a HTML 404 page.

### wordpress-endpoints.json

The wordpress oEmbed endpoint needs the extra parmeter `for` through which the consumer
must identify itself.

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

There are named patterns that reference standard oEmbed parameters: `{format}`, `{url}`,
`{maxwidth}`, `{maxheight}`, `{callback}`. `{callback}` is not strictly standard but it's
commonly used if the endpoint supports JSONP. Currently only `{format}` is used in
`endpoints.json`.

And then there are patterns that reference match groups in the URL patterns, e.g. `{1}`
for the first matched group, `{2}` for the second etc.

If a pattern occures in the query string of URL it's value should be URL-encoded.

**TODO:** Maybe it should be URL encoded in any case?

### Pattern Syntax

There are several named patterns:

 * `{protocol}` is any valid protocol, without `:`
 * `{domain}` is any valid domain name, without `.`
 * `{path}` is any URI path string (no query string or anchor)
 * `{path-component}` is any URI path string that does not contain `/`
 * `{query}` is any query string, starting with `?`
 * `{anchor}` is any anchor, starting with `#`
 * `{any}` is any non-zero length string

The meaning of the `*` placeholder depends on where it occurs. In the protocol part
of an URL it expands to `{protocol}`, in the hsotname part it expands to `{domain}`
in the rest it expands to `{path-component}` unless if it is at the very end. Then
it expands to `{any}`.

You can define a match group by enclosing a part of the URL pattern by parenthesis `(...)`.
This can be used to reference the matched string in the endpoint URL.

You can define an optional part by enclosing it with square brackets `[...]`.

If you wonder why I didn't just use regular expressions: It's because the regular expression
syntax is different in every programming language. However, this pattern language should
be easy to convert to regular expressions. See an example of how this can be done in
`oembedregistry.js`.

Sources
-------

Sources used to compile this list where amongst others (I'm still working through this sources):

 * [oohEmbed](http://oohembed.com): [endpoints.json](https://code.google.com/p/oohembed/source/browse/app/provider/endpoints.json)
 * [embedr](https://github.com/agoragames/oembedr): [providers.rb](https://github.com/agoragames/oembedr/blob/master/lib/oembedr/providers.rb)
 * [iframely](https://github.com/itteco/iframely): [providers.json](https://github.com/itteco/iframely/blob/master/providers.json)
 * [Foswiki OEmbed Extension](http://foswiki.org/Extensions/OEmbedPlugin): `lib/Foswiki/Plugins/OembedPlugin/Config.spec`
 * [CKEditor-oEmbed-Plugin](https://github.com/w8tcha/CKEditor-oEmbed-Plugin): [jquery.oembed.js](https://github.com/w8tcha/CKEditor-oEmbed-Plugin/blob/master/oembed/libs/jquery.oembed.js)
 * [embed.ly](http://embed.ly): [services](http://api.embed.ly/1/services)

License
-------

The files `endpoints.json`, `broken-endpoints.json`, `wordpress-endpoints.json`,
`endpoints-regexp.json` and `endpoints-simple.json` are in the public domain.
