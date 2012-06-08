# Coccyx

Having trouble tracking down and dealing with all those Backbone leaks?  [Coccyx](http://en.wikipedia.org/wiki/Coccyx) gives you two things to help avoid and track down leaks:

## TearDown-able view hierarchies

Views are only garbage collected when their reference counts drop to zero.  This cannot happen until all event bindings pointing to callbacks on the view are unbound.  Coccyx adds the `tearDown` method to all Backbone views.  When you're done with a `view` and want to make sure it is garbage collected, simply call

    view.tearDown();
    
This does the following things:

  - Remove any event callbacks bound to `view.model`
  - Remove any event callbacks bound to `view.collection`
  - `undelegateEvents()`
  - Call `view.beforeTearDown()` (if such a method exists)
  - Call tearDown on any subViews (see "[Tearing Down SubViews](#tearing-down-subview-hierarchies)" below for more on adding/removing subviews)
  - Remove `view.$el` from the DOM

### Cleaning up model and collection bindings
For `model` and `collection` callbacks to be torn down you must pass the `view` as the context when using Backbone's `on` method:

    this.model.on('change', view.callback, view);
    
This has the added benefit that you do not need to remember to `_.bind(view.callback, view)`

### Cleaning up DOM event bindings
Coccyx calls Backbone's `view.undelegateEvents` to clear out DOM event bindings.  Therefore, you must bind events using either the `events` hash or the `delegateEvents` method.

### Cleaning up other bindings
Your view will often have to hook bindings into `Backbone.event` objects other than `view.model` and `view.collection`.  You may also need to add DOM event bindings that are not appropriate for `delegateEvents`.  In such instances you should add a custom `beforeTearDown` method to your Backbone view.  Coccyx will call this method if it exists.  Here's an example usecase:

    MyView = Backbone.View.extend({
      initialize: function() {
        this.boundResizeHandler = _.bind(this.resizeHandler, this);
        $(window).on('resize', this.boundResizeHandler);
          
        this.aSpecialModel = new Backbone.model();          
        this.aSpecialModel.on('change', this.changeHandler, this);
      },
        
      beforeTearDown: function() {
        $(window).off('resize', this.boundResizeHandler);
        this.aSpecialModel.off(null, null, this);
      },
        
      changeHandler: function() {
        ...
      },
      
      resizeHandler: function() {
        ...
      }
    })

### Tearing Down SubView Hierarchies
The most useful aspect of `tearDown` is the fact that it will recursively call `tearDown` on all subviews associated with the view.  This makes it very easy to ensure that entire Backbone view hierarchies are cleaned up simply by calling `tearDown` on the root node of the hierarchy.

For `tearDown` to know what a view's subviews are you must pass any Backbone `subView`s to the `view` via:

    view.registerSubView(subView);
    
`registerSubView` returns the passed in `subView`

If you are removing a `subView` by calling `subView.tearDown()` there is no need to unregister the subview.  Otherwise you must:

    view.unregisterSubView(subView);
    
when removing a subview.


## Named Constructors
Sick and tired of seeing `child` printed out when you console.log a backbone object?  This minor annoyance becomes a serious concern when trying to use Chrome's excellent [heap profiler](https://developers.google.com/chrome-developer-tools/docs/heap-profiling) to find leaks and analyze their retaining tree -- which of those many `child`s is the object you're looking for?

Coccyx solves this problem by providing the `constructorName` property.  Simple pass a descriptive class name in for `constructorName` to your Model, Collection, View or Router and see it appear on the console and in the heap profiler.  Since the heap profiler allows you to search by constructor name you can very quickly find objects of concern and make sure they are getting correctly cleaned up.

Here's an example:

    var AnimalModel = Backbone.Model.extend({
      constructorName: 'AnimalModel'
    });
    
    var dog = new AnimalModel({name: 'bagel'});
    console.log(dog);
    
    > ▶ AnimalModel

**Note**: Underscore's `bindAll` method works by iterating over all functions on an object and wrapping them in anonymous closures.  This includes the constructor function which means, unfortunately, that your object will lose its constructorName.  Best to avoid `bindAll` and actually pay attention to where you need to bind methods.  Alternatively... you could monkey patch Underscore...