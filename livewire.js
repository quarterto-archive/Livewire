(function(){
  var sync, Router, toString$ = {}.toString, slice$ = [].slice;
  sync = require('sync');
  module.exports = new (Router = (function(){
    Router.displayName = 'Router';
    var time, prototype = Router.prototype, constructor = Router;
    time = function(){
      return compose$([
        function(it){
          return it.getTime();
        }, (function(it){
          return new it;
        })
      ])(
      Date);
    };
    prototype.routes = [];
    String.prototype.pipe = function(it){
      return it.end(String(this));
    };
    Buffer.prototype.pipe = function(it){
      return it.end(this);
    };
    prototype.respond = curry$(function(method, path, funcs){
      var params, reg;
      reg = (function(){
        switch (toString$.call(path).slice(8, -1)) {
        case 'String':
          params = unfold(function(reg){
            var that;
            if (that = reg.exec(path)) {
              path = path.replace(reg, '([^\\/]+)');
              return [that[1], reg];
            }
          })(
          /:([a-z$_][a-z0-9$_]*)/i);
          return RegExp("^" + path + "$", 'i');
        case 'RegExp':
          return path;
        case 'Function':
          return {
            test: path,
            exec: path
          };
        default:
          throw new TypeError("Invalid path " + path);
        }
      }());
      return each(bind$(this.routes, 'push'))(
      concatMap(compose$([
        (function(it){
          return import$(it, (function(orig){
            return {
              match: function(req){
                return (method == 'ANY' || method == req.method) && (orig != null
                  ? orig
                  : compose$([
                    bind$(reg, 'test'), function(it){
                      return it.url;
                    }
                  ]))(req);
              },
              extract: function(req){
                var ref$, values, that;
                values = (ref$ = reg.exec(req.url)) != null
                  ? ref$
                  : [];
                import$(req.params || (req.params = {}), (that = params) != null ? listToObj(
                zip(that)(
                tail(values))) : values);
                return this;
              }
            };
          }.call(this, it.match)));
        }), function(it){
          return it.async();
        }
      ]))(
      [].concat(funcs)));
    });
    import$(prototype, map(prototype.respond, {
      'ANY': 'ANY',
      'GET': 'GET',
      'POST': 'POST',
      'PUT': 'PUT',
      'DELETE': 'DELETE',
      'OPTIONS': 'OPTIONS',
      'TRACE': 'TRACE',
      'PATCH': 'PATCH',
      'CONNECT': 'CONNECT',
      'HEAD': 'HEAD'
    }));
    function Router(){
      var server, this$ = this instanceof ctor$ ? this : new ctor$;
      server = require('http').createServer(function(req, res){
        return sync(function(){
          var start, ref$, end$, e;
          try {
            start = time();
            ref$ = [
              res.end, function(){
                console.log(res.statusCode + " " + req.url + ": " + (time() - start) + "ms");
                return end$.apply(this, arguments);
              }
            ], end$ = ref$[0], res.end = ref$[1];
            return function(it){
              return it.pipe(res);
            }(
            fold(curry$(function(x$, y$){
              return y$(x$);
            }), "404 " + req.url)(
            map(compose$([
              function(it){
                return partialize$(it.sync, [req, res, void 8], [2]);
              }, function(it){
                return it.extract(req);
              }
            ]))(
            filter(function(it){
              return it.match(req);
            }, this$.routes))));
          } catch (e$) {
            e = e$;
            return res.end(e.stack);
          }
        });
      });
      return importAll$(server, this$);
      return this$;
    } function ctor$(){} ctor$.prototype = prototype;
    return Router;
  }()));
  function compose$(fs){
    return function(){
      var i, args = arguments;
      for (i = fs.length; i > 0; --i) { args = [fs[i-1].apply(this, args)]; }
      return args[0];
    };
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function curry$(f, args){
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      return params.push.apply(params, arguments) < f.length && arguments.length ?
        curry$.call(this, f, params) : f.apply(this, params);
    } : f;
  }
  function partialize$(f, args, where){
    return function(){
      var params = slice$.call(arguments), i,
          len = params.length, wlen = where.length,
          ta = args ? args.concat() : [], tw = where ? where.concat() : [];
      for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
      return len < wlen && len ? partialize$(f, ta, tw) : f.apply(this, ta);
    };
  }
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
}).call(this);
