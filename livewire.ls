sync = require \sync

module.exports = new class Router
	routes:[]

	respond(method,path,funcs):
		reg = switch typeof! path
		| \String =>
			params = /:([a-z$_][a-z0-9$_]*)/i |> unfold (reg)->if reg.exec path
				path .= replace reg, /([^\/]+)/$
				[that.1,reg]
			RegExp "^#{path}$",\i
		| \RegExp =>  path
		| \Function => test:path,exec:path
		| otherwise => throw new TypeError "Invalid path #path"

		[]+++funcs |> concat-map (.async!)>>(import do
			match: it.match ? (req)->method in [\ANY req.method] and reg.test req.url
			extract: it.extract ? (req)->
				values = (reg.exec req.url) ? []
				if params? then tail values |> zip that |> list-to-obj else values
		) |> each @routes~push
	use: ->@routes.push it

	::<<< map ::respond, {\ANY \GET \POST \PUT \DELETE \OPTIONS \TRACE \PATCH \CONNECT \HEAD}

	~>
		server = require \http .create-server (req,res)~>sync ~>try
			console.time "#{req.method} #{req.url}"
			[end$,req.end] = [req.end,->console.time-end "#{req.method} #{req.url}"]

			out = filter (.match req), @routes
			|> each (req@params import)<<(.extract req)
			|> fold ((out,route)->route.sync req,res,out),"404 #{req.url}"
			res.write-head res.status-code, res@headers
			out |> if out.readable then (.pipe res) else res~end
		catch => res.end e.stack

		return server import all this