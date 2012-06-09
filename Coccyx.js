//     Coccyx.js 0.1.0

//     (c) 2012 Onsi Fakhouri
//     Coccyx.js may be freely distributed under the MIT license.
//     http://github.com/onsi/coccyx

(function() {
  var originalExtend = Backbone.Model.extend;
  
  var extend = function(protoProps, classProps) {
    var parent = this;
    if (protoProps.constructorName && !protoProps.hasOwnProperty('constructor')) {
      eval("protoProps.constructor = function " + protoProps.constructorName + " () { parent.apply(this, arguments) };");
    }
    return originalExtend.call(parent, protoProps, classProps);
  }
  
  Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = extend;
})();

_.extend(Backbone.View.prototype, {
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
    this._tearDown();
    if (this.__parentView) this.__parentView.unregisterSubView(this);
    this.remove();
    return this;
  },
  
  _tearDown: function() {
    if (this.beforeTearDown) this.beforeTearDown();
    this.undelegateEvents();
    if (this.model) this.model.off(null, null, this);
    if (this.collection) this.collection.off(null, null, this);
    _(this.subViews).each(function(subView) {
      subView._tearDown();
    });
    this.subViews = {};
  }
});