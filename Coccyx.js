//     Coccyx.js 0.3.0

//     (c) 2012 Onsi Fakhouri
//     Coccyx.js may be freely distributed under the MIT license.
//     http://github.com/onsi/coccyx

var Coccyx = {
  enforceContextualBinding: false,
  enforceConstructorName: false,
  _globalTearDownCallbacks: [],
  addTearDownCallback: function(callback) {
    Coccyx._globalTearDownCallbacks.push(callback);
  }
};

(function() {
  var originalExtend = Backbone.Model.extend;

  var extend = function(protoProps, classProps) {
    var parent = this;
    if (Coccyx.enforceConstructorName && !protoProps.constructorName) throw "Coccyx: Attempted to create a new class without passing in a constructor name."
    if (protoProps.constructorName && !protoProps.hasOwnProperty('constructor')) {
      eval("protoProps.constructor = function " + protoProps.constructorName + " () { parent.apply(this, arguments) };");
    }
    return originalExtend.call(parent, protoProps, classProps);
  }

  Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = extend;

  var originalOn = Backbone.Events.on;

  Backbone.Events.on = function(events, callback, context) {
    var returnValue = originalOn.apply(this, arguments);
    if (Coccyx.enforceContextualBinding && !context) throw "Coccyx: Backbone event binding attempted without a context."
    if (context && context.registerEventDispatcher) context.registerEventDispatcher(this);
    return returnValue;
  }

  Backbone.Model.prototype.on = Backbone.Collection.prototype.on = Backbone.Router.prototype.on = Backbone.View.prototype.on = Backbone.Events.on;
  Backbone.Model.prototype.bind = Backbone.Collection.prototype.bind = Backbone.Router.prototype.bind = Backbone.View.prototype.bind = Backbone.Events.bind = Backbone.Events.on;
})();

_.extend(Backbone.View.prototype, {
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
});