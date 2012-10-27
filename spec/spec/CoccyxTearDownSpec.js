var CustomView = Coccyx.root.View.extend({
  className: 'custom-div',

  initialize: function() {
    this.buttonClicks = 0;
    this.modelChanges = 0;
    this.otherModelChanges = 0;
    this.collectionAdds = 0;
    this.keyUpPresses = 0;

    this.model.on('change', this.modelChange, this);
    this.collection.on('add', this.collectionAdd, this);

    this.otherModel = new Coccyx.root.Model();
    this.otherModel.on('change', this.otherModelChange, this);

    this.boundKeyUpHandler = _.bind(this.keyUpHandler, this);
    $(document).on('keyup', this.boundKeyUpHandler);
  },

  events: {
    'click .button': 'buttonClick'
  },

  render: function() {
    this.$el.append('<div class="button"></div>');

    this.subView = this.registerSubView(new CustomSubView());
    this.$el.append(this.subView.el);

    this.otherSubView = this.registerSubView(new CustomSubView());
    this.$el.append(this.otherSubView.el);

    return this;
  },

  beforeTearDown: function() {
    $(document).off('keyup', this.boundKeyUpHandler);
  },

  buttonClick: function() {
    this.buttonClicks++;
  },

  modelChange: function() {
    this.modelChanges++;
  },

  collectionAdd: function() {
    this.collectionAdds++;
  },

  otherModelChange: function() {
    this.otherModelChanges++;
  },

  keyUpHandler: function() {
    this.keyUpPresses++;
  }
});

var CustomSubView = Coccyx.root.View.extend({
  className: 'sub-view',

  initialize: function() {
    this.modelChanges = 0;
    this.model = new Coccyx.root.Model();
    this.model.on('change', this.modelChange, this);
  },

  modelChange: function() {
    this.modelChanges++;
  }
});

describe('Coccyx', function() {
  var model, collection, view;

  beforeEach(function() {
    model = new Coccyx.root.Model();
    collection = new Coccyx.root.Collection([]);
    view = new CustomView({
      model: model,
      collection: collection
    }).render();

    $('#content').append(view.el);
  });

  describe('tearDown', function() {
    it('should return the view', function() {
      expect(view.tearDown()).toEqual(view);
    });

    it('should have been torn down', function() {
      expect(view).not.toHaveBeenTornDown();
      view.tearDown();
      expect(view).toHaveBeenTornDown();
    });

    it('should unbind any delegate event listeners', function() {
      expect(view.buttonClicks).toEqual(0);
      $('.button').click();
      expect(view.buttonClicks).toEqual(1);

      view._tearDown();

      expect($('.button')[0]).toBeTruthy();
      $('.button').click();
      expect(view.buttonClicks).toEqual(1);
    });

    it('should unbind any bindings to any root objects', function() {
      model.set('bump', 1);
      view.otherModel.set('bump', 1);
      collection.add({'foo': 1});
      expect(view.modelChanges).toEqual(1);
      expect(view.collectionAdds).toEqual(1);
      expect(view.otherModelChanges).toEqual(1);

      view.tearDown();

      model.set('bump', 2);
      collection.add({'foo': 2});
      view.otherModel.set('bump', 2);
      expect(view.modelChanges).toEqual(1);
      expect(view.collectionAdds).toEqual(1);
      expect(view.otherModelChanges).toEqual(1);
    });

    it('should remove $el from the DOM', function() {
      expect($('.custom-div').length).toEqual(1);
      view.tearDown();
      expect($('.custom-div').length).toEqual(0);
    });

    it('should call beforeTearDown, allowing the user to tear down any custom events', function() {
      $(document).trigger('keyup');
      expect(view.keyUpPresses).toEqual(1);
      view.tearDown();
      $(document).trigger('keyup');
      expect(view.keyUpPresses).toEqual(1);
    });

    it('should call any globally registered callbacks', function() {
      var nCalls = 0;
      Coccyx.addTearDownCallback(function() {
        nCalls += 1;
        console.log(this);
      });
      view.tearDown();
      expect(nCalls).toEqual(3); //one for each subview
      Coccyx._globalTearDownCallbacks = []; //clean up after ourselves
    });
  });
  
  describe('registering event dispatchers', function() {
    var dispatcher;
    beforeEach(function() {
      dispatcher = _.clone(Coccyx.root.Events);
      dispatcher.on('custom', view.buttonClick, view);
    });

    it('should automatically register event dispatchers whenever on is used', function() {
      expect(view.eventDispatchers[dispatcher._coccyxId]).toEqual(dispatcher);
      dispatcher.trigger('custom');
      expect(view.buttonClicks).toEqual(1);
    });

    it('should honor the return value for on', function() {
      expect(dispatcher.on('bunnies', view.buttonClick, view)).toEqual(dispatcher);
    });

    it('should unregister the event dispatcher when the view is torn down', function() {
      view.tearDown();
      dispatcher.trigger('custom');
      expect(view.buttonClicks).toEqual(0);
      expect(view.eventDispatchers[dispatcher._coccyxId]).toBeFalsy();
    });

    it('should unbind from the event dispatcher whenever unregisterEventDispatcher is called', function() {
      view.unregisterEventDispatcher(dispatcher);
      dispatcher.trigger('custom');
      expect(view.buttonClicks).toEqual(0);
      expect(view.eventDispatchers[dispatcher._coccyxId]).toBeFalsy();
    });

    describe('when Coccyx.enforceContextualBinding is true', function() {
      it('should throw when a binding is attempted without a context', function() {
        Coccyx.enforceContextualBinding = true;
        expect(function() {
          dispatcher.on('bunnies', view.buttonClick)
        }).toThrow();
      });
    });

    describe('when Coccyx.enforceContextualBinding is false', function() {
      it('should not throw when a binding is attempted without a context', function() {
        Coccyx.enforceContextualBinding = false;
        expect(function() {
          dispatcher.on('bunnies', view.buttonClick)
        }).not.toThrow();
      });
    });
  });

  describe('registering, unregistering, and tearing down subviews', function() {
    describe('when a subview is registered', function() {
      it('should be accesible via cid on view.subviews', function() {
        expect(view.subViews[view.subView.cid]).toEqual(view.subView);
      });

      it('should haveRegisteredSubView', function() {
        expect(view).toHaveRegisteredSubView(view.subView);
        expect(view).toHaveRegisteredSubView(view.otherSubView);
      });

      it('should be torn down when tearDown is called on the parent view', function() {
        view.subView.model.set('bump', 1);
        view.otherSubView.model.set('bump', 1);

        expect(view.subView.modelChanges).toEqual(1);
        expect(view.otherSubView.modelChanges).toEqual(1);

        expect(view.subView).not.toHaveBeenTornDown();
        expect(view.otherSubView).not.toHaveBeenTornDown();

        view.tearDown();

        view.subView.model.set('bump', 2);
        view.otherSubView.model.set('bump', 2);

        expect(view.subView.modelChanges).toEqual(1);
        expect(view.otherSubView.modelChanges).toEqual(1);

        expect(_.keys(view.subViews).length).toEqual(0);
        expect(view.subView.__parentView).toBeFalsy();
        expect(view.otherSubView.__parentView).toBeFalsy();
        
        expect(view.subView).toHaveBeenTornDown();
        expect(view.otherSubView).toHaveBeenTornDown();
      });

      describe('when a subview is torn down', function() {
        it('should unregister from its parent', function() {
          var subView = view.subView;

          expect(view.subViews[subView.cid]).toEqual(subView);
          expect(subView.__parentView).toEqual(view);
          subView.tearDown();
          expect(view.subViews[subView.cid]).toBeFalsy();
          expect(subView.__parentView).toBeFalsy();
        });
      });

      describe('tearDownRegisteredSubViews', function() {
        it('should tear down all registered subviews', function() {
          expect(view.subView).not.toHaveBeenTornDown();
          expect(view.otherSubView).not.toHaveBeenTornDown();
  
          view.tearDownRegisteredSubViews();
  
          expect(view.subView).toHaveBeenTornDown();
          expect(view.otherSubView).toHaveBeenTornDown();
          expect(view).not.toHaveRegisteredSubView(view.subView);
          expect(view).not.toHaveRegisteredSubView(view.otherSubView);
        });
      });
    })

    describe('when a subview is unregistered', function() {
      it('should be removed from view.subviews and have its __parent pointer removed', function() {
        view.unregisterSubView(view.subView);
        expect(view.subView.__parent).toBeFalsy();
        expect(view.subViews[view.subView.cid]).toBeFalsy();
      });

      it('should not be torn down when tearDown is called on the parent view', function() {
        view.unregisterSubView(view.otherSubView);
        view.tearDown();

        expect(view.subView).toHaveBeenTornDown();
        expect(view.otherSubView).not.toHaveBeenTornDown();
      });
    });
  });
});