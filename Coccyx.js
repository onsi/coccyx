//     Coccyx.js 0.3.0

//     (c) 2012 Onsi Fakhouri
//     Coccyx.js may be freely distributed under the MIT license.
//     http://github.com/onsi/coccyx

(function() {
  var Coccyx;

  if (typeof exports !== 'undefined') {
    Coccyx = exports;
  } else {
    this.Coccyx = this.Coccyx || {};
    Coccyx = this.Coccyx;
  }

  Coccyx.enforceContextualBinding = false;
  Coccyx.enforceConstructorName   = false;
  Coccyx.unobtrusive              = Coccyx.unobtrusive || false;

  Coccyx._globalTearDownCallbacks = [];
  Coccyx.addTearDownCallback = function(callback) {
    Coccyx._globalTearDownCallbacks.push(callback);
  };

  var originalExtend = Backbone.Model.extend;
  var extendWithConstructorName = function(protoProps, classProps) {
    var parent = this;
    if (Coccyx.enforceConstructorName && !protoProps.constructorName) throw "Coccyx: Attempted to create a new class without passing in a constructor name."
    if (protoProps.constructorName && !protoProps.hasOwnProperty('constructor')) {
      eval("protoProps.constructor = function " + protoProps.constructorName + " () { parent.apply(this, arguments) };");
    }

    return originalExtend.call(parent, protoProps, classProps);
  };

  var eventManager = {
    registerEventDispatcher: function(dispatcher) {
      dispatcher._coccyxId = dispatcher._coccyxId || dispatcher.cid || _.uniqueId('coccyx');
      this.eventDispatchers = this.eventDispatchers || {};
      this.eventDispatchers[dispatcher._coccyxId] = dispatcher;
    },

    unregisterEventDispatcher: function(dispatcher){
      dispatcher.off(null, null, this);
      delete this.eventDispatchers[dispatcher._coccyxId];
    },

    registerSubView: function(subView) {
    this.subViews = this.subViews || {};
      this.subViews[subView.cid] = subView;
      subView.__parentView = this;
      return subView;
    },

    unregisterSubView: function(subView) {
      subView.__parentView = undefined;
      delete this.subViews[subView.cid];
    },

    tearDown: function() {
      if (this.__parentView) this.__parentView.unregisterSubView(this);
      this._tearDown();
      this.$el.remove();
      return this;
    },

    tearDownRegisteredSubViews: function() {
    	_.chain(this.subViews).values().invoke('tearDown');
    },

    _tearDown: function() {
      var that = this;
      if (this.beforeTearDown) this.beforeTearDown();
      _(Coccyx._globalTearDownCallbacks).each(function(callback) {
        callback.apply(that);
      });
      this.undelegateEvents();
      this.__parentView = null;
      _(this.eventDispatchers).invoke('off', null, null, this);
      this.eventDispatchers = {};
      _(this.subViews).invoke('_tearDown');
      this.subViews = {};
    }
  };

  var originalOn = Backbone.Events.on;
  var onWithContext = function (events, callback, context) {
    var returnValue = originalOn.apply(this, arguments);
    if (Coccyx.enforceContextualBinding && !context) throw "Coccyx: Event binding attempted without a context."
    if (context && context.registerEventDispatcher) context.registerEventDispatcher(this);
    return returnValue;
  };

  Coccyx.Events = _.extend({}, Backbone.Events, {
    on: onWithContext,
    bind: onWithContext
  });

  if (Coccyx.unobtrusive) {
    Coccyx.Model = Backbone.Model.extend({});
    Coccyx.Collection = Backbone.Collection.extend({});
    Coccyx.Router = Backbone.Router.extend({});
    Coccyx.View = Backbone.View.extend({});
  } else {
    Coccyx.Model = Backbone.Model;
    Coccyx.Collection = Backbone.Collection;
    Coccyx.Router = Backbone.Router;
    Coccyx.View = Backbone.View;
  }

  _.each([Coccyx.Model, Coccyx.Collection, Coccyx.Router, Coccyx.View ], function(klass) {
    klass.extend = extendWithConstructorName;
    _.extend(klass.prototype, Coccyx.Events);
  });

  _.extend(Coccyx.View.prototype, eventManager);
})();
