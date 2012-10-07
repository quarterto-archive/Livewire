(function(){
  var sync, ref$, map, filter, fold, each, unfold, Router, slice$ = [].slice;
  sync = require('sync');
  ref$ = require('prelude-ls'), map = ref$.map, filter = ref$.filter, fold = ref$.fold, each = ref$.each, unfold = ref$.unfold;
  module.exports = new (Router = (function(){
    Router.displayName = 'Router';
    var prototype = Router.prototype, constructor = Router;
    prototype.respond = curry$(function(method, path, funcs){
      var params, reg;
      params = unfold(function(reg){
        var that;
        if (that = reg.exec(path)) {
          path = path.replace(reg, '([^\\/]+)');
          return [that[0], reg];
        }
      })(
      /:([a-z$_][a-z0-9$_]*)/i);
      reg = RegExp("^" + path + "$", 'i');
      return this.routes = this.routes.concat(each(function(it){
        var ref$;
        return (ref$ = it.match) != null
          ? ref$
          : it.match = function(req){
            var ref$, m, values;
            if (method == 'ANY' || method == req.method) {
              ref$ = (ref$ = reg.exec(req.url)) != null
                ? ref$
                : [], m = ref$[0], values = slice$.call(ref$, 1);
              if (m != null) {
                return listToObj(
                zip(params, values));
              }
            }
          };
      })(
      map(function(it){
        return it.async();
      })(
      funcs)));
    });
    map(function(it){
      return prototype[it] = prototype.respond(it.toUpperCase());
    })(
    ['any', 'get', 'post', 'put', 'delete', 'options', 'trace', 'patch', 'connect', 'head']);
    prototype['*'] = prototype.any;
    function Router(){
      var server, this$ = this instanceof ctor$ ? this : new ctor$;
      this$.routes = [];
      server = require('http').createServer(function(req, res){
        return sync(function(){
          var e;
          try {
            console.time(req.method + " " + req.url);
            bind$(res, 'end')(
            fold(function(out, route){
              return route.sync(req, res, out);
            }, "404 " + req.url)(
            each(compose$([
              (function(it){
                return import$(req.params || (req.params = {}), it);
              }), function(it){
                return it.match(req);
              }
            ]))(
            filter(function(it){
              return it.match(req);
            })(
            this$.routes))));
            return console.timeEnd(req.method + " " + req.url);
          } catch (e$) {
            e = e$;
            return console.warn(e.stack);
          }
        });
      });
      return importAll$(server, this$);
      return this$;
    } function ctor$(){} ctor$.prototype = prototype;
    return Router;
  }()));
  function curry$(f, args){
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      return params.push.apply(params, arguments) < f.length && arguments.length ?
        curry$.call(this, f, params) : f.apply(this, params);
    } : f;
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
  function compose$(fs){
    return function(){
      var i, args = arguments;
      for (i = fs.length; i > 0; --i) { args = [fs[i-1].apply(this, args)]; }
      return args[0];
    };
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
}).call(this);