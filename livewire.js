(function(){
  var sync, url, Request, Response, Router, instanceTracker, MatcherRouter, Matcher, StringMatcher, slice$ = [].slice;
  sync = require('sync');
  url = require('url');
  String.prototype.pipe = function(it){
    return it.end(this.constructor(this));
  };
  Buffer.prototype.pipe = function(it){
    return it.end(this);
  };
  exports.Request = Request = (function(){
    Request.displayName = 'Request';
    var prototype = Request.prototype, constructor = Request;
    prototype.params = {};
    function Request(req){
      var this$ = this instanceof ctor$ ? this : new ctor$;
      import$(this$, req);
      import$(this$, url.parse(req.url, true));
      return this$;
    } function ctor$(){} ctor$.prototype = prototype;
    return Request;
  }());
  exports.Response = Response = (function(){
    Response.displayName = 'Response';
    var prototype = Response.prototype, constructor = Response;
    function Response(res){
      var this$ = this instanceof ctor$ ? this : new ctor$;
      import$(this$, res);
      return this$;
    } function ctor$(){} ctor$.prototype = prototype;
    return Response;
  }());
  exports.Router = Router = (function(){
    Router.displayName = 'Router';
    var prototype = Router.prototype, constructor = Router;
    Router.subclasses = [];
    Router.extended = function(subclass){
      return this.subclasses.push(subclass);
    };
    Router.create = function(method){
      var spec, that;
      spec = slice$.call(arguments, 1);
      if (that = find(function(it){
        return typeof it.supports === 'function' ? it.supports.apply(null, spec) : void 8;
      }, this.subclasses)) {
        return that.apply(null, [method].concat(slice$.call(spec)));
      } else {
        throw new TypeError("No routers can handle " + spec + ".");
      }
    };
    Router.route = function(req){
      return concatMap(function(it){
        return it.find(req);
      }, constructor.subclasses);
    };
    Router.error = curry$(function(res, err){
      var ref$;
      if (err != null) {
        res.statusCode = 500;
        res.end();
        return console.error((ref$ = err.stack) != null
          ? ref$
          : err.toString());
      }
    });
    Router.find = function(req){
      return concatMap(function(it){
        return it.handlers();
      })(
      filter(function(it){
        return it.match(req);
      }, this.instances));
    };
    prototype.match = function(){
      throw new TypeError(this.constructor.displayName + " does not implement match");
    };
    prototype.handlers = function(){
      throw new TypeError(this.constructor.displayName + " does not implement handlers");
    };
    prototype.extract = function(){
      throw new TypeError(this.constructor.displayName + " does not implement extract");
    };
    function Router(){
      var this$ = this instanceof ctor$ ? this : new ctor$;
      throw new TypeError(this$.constructor.displayName + " is abstract and can't be instantiated.");
      return this$;
    } function ctor$(){} ctor$.prototype = prototype;
    return Router;
  }());
  function delegate(methods, unto){
    var i$, len$, method, results$ = {};
    for (i$ = 0, len$ = methods.length; i$ < len$; ++i$) {
      method = methods[i$];
      results$[method] = fn$;
    }
    return results$;
    function fn$(){
      return this[unto][method].apply(this, arguments);
    }
  }
  instanceTracker = function(constr){
    return function(){
      var obj, ref$;
      obj = constr.apply(this, arguments);
      ((ref$ = this.constructor).instances || (ref$.instances = [])).push(obj);
      return obj;
    };
  };
  MatcherRouter = (function(superclass){
    var constructor$$, prototype = extend$((import$(MatcherRouter, superclass).displayName = 'MatcherRouter', MatcherRouter), superclass).prototype, constructor = MatcherRouter;
    function MatcherRouter(){
      return constructor$$.apply(this, arguments);
    }
    MatcherRouter.supports = function(spec){
      return spec instanceof Matcher || any(function(it){
        return it.supports(spec);
      }, Matcher.subclasses);
    };
    prototype.handlers = function(){
      return [this.handler];
    };
    constructor$$ = instanceTracker(function(matcher, handler){
      MatcherRouter.matcher = matcher;
      MatcherRouter.handler = handler;
      if (!(matcher instanceof Matcher)) {
        return MatcherRouter.matcher = Matcher.create(matcher);
      }
    });
    return MatcherRouter;
  }(Router));
  Matcher = (function(){
    Matcher.displayName = 'Matcher';
    var prototype = Matcher.prototype, constructor = Matcher;
    Matcher.subclasses = [];
    Matcher.extended = bind$(Matcher.subclasses, 'push');
    Matcher.create = function(spec){
      var that;
      if (that = find(function(it){
        return it.supports(spec);
      }, this.subclasses)) {
        return that(spec);
      } else {
        throw new TypeError("No matchers can handle " + spec + ".");
      }
    };
    function Matcher(){
      var this$ = this instanceof ctor$ ? this : new ctor$;
      throw new TypeError(this$.constructor.displayName + " is abstract and can't be instantiated.");
      return this$;
    } function ctor$(){} ctor$.prototype = prototype;
    prototype.match = function(){
      throw new TypeError(this.constructor.displayName + " does not implement match");
    };
    prototype.extract = function(){
      throw new TypeError(this.constructor.displayName + " does not implement extract");
    };
    return Matcher;
  }());
  StringMatcher = (function(superclass){
    var prototype = extend$((import$(StringMatcher, superclass).displayName = 'StringMatcher', StringMatcher), superclass).prototype, constructor = StringMatcher;
    function StringMatcher(method, path, handler){
      var this$ = this instanceof ctor$ ? this : new ctor$;
      this$.method = method;
      this$.path = path;
      this$.handler = handler;
      this$.params = [];
      this$.reg = partialize$(RegExp, [void 8, 'i'], [0])(
      function(it){
        return ("^" + it) + ('/' === last(path) ? '' : '$');
      }(
      path.replace(/:([a-z$_][a-z0-9$_]*)/i, function(m, param){
        this$.params.push(param);
        return '([^\\/]+)';
      })));
      return this$;
    } function ctor$(){} ctor$.prototype = prototype;
    StringMatcher.supports = function(it){
      return typeof it === 'string';
    };
    prototype.match = function(req){
      return this.reg.test(req.pathname);
    };
    prototype.extract = function(req){
      var ref$;
      return listToObj(
      zip(this.params)(
      tail(
      (ref$ = this.reg.exec(req.pathname)) != null
        ? ref$
        : [])));
    };
    return StringMatcher;
  }(Matcher));
  each(function(method){
    var this$ = this;
    return exports[method] = function(){
      var spec;
      spec = slice$.call(arguments);
      return Router.create.apply(Router, [method].concat(slice$.call(spec)));
    };
  })(
  ['ANY', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT', 'HEAD']);
  exports.app = function(req, res){
    var this$ = this;
    return sync(function(){
      var augReq, tap, fns, res$, i$, ref$, len$, route, e;
      try {
        augReq = Request(req);
        tap = curry$(function(fn, a){
          fn(a);
          return a;
        });
        res$ = [];
        for (i$ = 0, len$ = (ref$ = Route.route(req)).length; i$ < len$; ++i$) {
          route = ref$[i$];
          res$.push((fn$.call(this$, augReq, res, route)));
        }
        fns = res$;
        return function(it){
          return it.on('error', Route.error(res));
        }(
        function(it){
          return it.pipe(augRes);
        }(
        fold(curry$(function(x$, y$){
          return x$(y$);
        }), "404 " + req.pathname)(
        fns)));
      } catch (e$) {
        e = e$;
        return Route.error(res, e);
      }
      function fn$(augReq, res, route){
        import$(augReq.params, route.extract(augReq));
        return function(it){
          return route.func.sync(augReq, Response(res), it);
        };
      }
    });
  };
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
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
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
}).call(this);
