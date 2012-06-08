var CustomView = Backbone.View.extend({
  className: 'custom-div',
        
  initialize: function() {
    this.buttonClicks = 0;
    this.modelChanges = 0;
    this.otherModelChanges = 0;
    this.collectionAdds = 0;
          
    this.model.on('change', this.modelChange, this);
    this.collection.on('add', this.collectionAdd, this);

    this.otherModel = new Backbone.Model();
    this.otherModel.on('change', this.otherModelChange, this);
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
    this.otherModel.off(null, null, this);
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
  }
});

var CustomSubView = Backbone.View.extend({
  className: 'sub-view',
  
  initialize: function() {
    this.modelChanges = 0;
    this.model = new Backbone.Model();
    this.model.on('change', this.modelChange, this);
  },
  
  modelChange: function() {
    this.modelChanges++;
  }
});

describe('Coccyx', function() {
  var model, collection, view;

  beforeEach(function() {
    model = new Backbone.Model();
    collection = new Backbone.Collection([]);
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
     
    it('should unbind any delegate event listeners', function() {
      expect(view.buttonClicks).toEqual(0);
      $('.button').click();
      expect(view.buttonClicks).toEqual(1);
      
      view._tearDown();
      
      expect($('.button')[0]).toBeTruthy();
      $('.button').click();
      expect(view.buttonClicks).toEqual(1);      
    });
    
    it('should unbind any connections to view.model', function() {
      expect(view.modelChanges).toEqual(0);
      model.set('bump', 1);
      expect(view.modelChanges).toEqual(1);
      
      view.tearDown();
      
      model.set('bump', 2);
      expect(view.modelChanges).toEqual(1);
    });
    
    it('should unbind any connections to view.collection', function() {
      expect(view.collectionAdds).toEqual(0);
      collection.add({'foo': 1});
      expect(view.collectionAdds).toEqual(1);
      
      view.tearDown();
      
      collection.add({'foo': 2});
      expect(view.collectionAdds).toEqual(1);
    });

    it('should remove $el from the DOM', function() {
      expect($('.custom-div').length).toEqual(1);
      view.tearDown();
      expect($('.custom-div').length).toEqual(0);      
    });
    
    it('should call beforeTearDown, allowing the user to tear down any custom events', function() {
      expect(view.otherModelChanges).toEqual(0);
      view.otherModel.set('bump', 1);
      expect(view.otherModelChanges).toEqual(1);
      
      view.tearDown();
      
      view.otherModel.set('bump', 2);
      expect(view.otherModelChanges).toEqual(1);
    });    
  });
  
  describe('registering and unregistering subviews', function() {
    describe('when a subview is registered', function() {
      it('should be accesible via cid on view.subviews', function() {
        expect(view.subViews[view.subView.cid]).toEqual(view.subView);
      });
      
      it('should be torn down when tearDown is called on the parent view', function() {
        expect(view.subView.modelChanges).toEqual(0);
        expect(view.otherSubView.modelChanges).toEqual(0);

        view.subView.model.set('bump', 1);
        view.otherSubView.model.set('bump', 1);

        expect(view.subView.modelChanges).toEqual(1);
        expect(view.otherSubView.modelChanges).toEqual(1);
      
        view.tearDown();
      
        view.subView.model.set('bump', 2);
        view.otherSubView.model.set('bump', 2);
      
        expect(view.subView.modelChanges).toEqual(1);
        expect(view.otherSubView.modelChanges).toEqual(1);
      });
      
      describe('when a subview is torn down', function() {
        it('should remove unregister from its parent', function() {
          var subView = view.subView;
          
          expect(view.subViews[subView.cid]).toEqual(subView);
          expect(subView.__parentView).toEqual(view);
          subView.tearDown();
          expect(view.subViews[subView.cid]).toBeFalsy();
          expect(subView.__parentView).toBeFalsy();
        });
      });
    })

    describe('when a subview is unregistered', function() {
      it('should be removed from view.subviews', function() {
        view.unregisterSubView(view.subView);
        expect(view.subViews[view.subView.cid]).toBeFalsy();
      });
      
      it('should not be torn down when tearDown is called on the parent view', function() {
        expect(view.subView.modelChanges).toEqual(0);
        expect(view.otherSubView.modelChanges).toEqual(0);

        view.subView.model.set('bump', 1);
        view.otherSubView.model.set('bump', 1);

        expect(view.subView.modelChanges).toEqual(1);
        expect(view.otherSubView.modelChanges).toEqual(1);
      
        view.unregisterSubView(view.otherSubView);
        view.tearDown();
      
        view.subView.model.set('bump', 2);
        view.otherSubView.model.set('bump', 2);
      
        expect(view.subView.modelChanges).toEqual(1);
        expect(view.otherSubView.modelChanges).toEqual(2);
      })
    })    
  })
});