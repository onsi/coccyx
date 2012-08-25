var NamedCustomView = Coccyx.View.extend({
  constructorName:'CustomView',
          
  initialize: function() {
    this.initialized = true;
  }
});
        
var UnnamedCustomView = Coccyx.View.extend({
  initialize: function() {
    this.initialized = true;
  }
});

describe('Coccyx', function() {
  describe('constructorName', function() {    
    describe('when constructorName is set on protoProperties', function() {
      var view;
      beforeEach(function() {
        view = new NamedCustomView();
      });
      
      it('should override the constructor such that instances have the correct name and log correctly', function() {
        expect(view.constructor.name).toEqual('CustomView');
      });
      
      it('should call through to the original constructor', function() {
        expect(view.initialized).toBeTruthy();
      });
      
      it('should work for models, collections, and routers too', function() {
        var model = new (Coccyx.Model.extend({constructorName:'MyModel'}))();
        expect(model.constructor.name).toEqual('MyModel');
        
        var collection = new (Coccyx.Collection.extend({constructorName:'MyCollection'}))();
        expect(collection.constructor.name).toEqual('MyCollection');

        var router = new (Coccyx.Router.extend({constructorName:'MyRouter'}))();
        expect(router.constructor.name).toEqual('MyRouter');
      });
      
      it('should not overwrite a passed in constructor', function() {
        var Grumpy = Coccyx.Model.extend({
          constructorName: 'DoItTheirWay',
          constructor:function DoItMyWay() {
            this.myWay = true;
            return this;
          }
        });
        
        var model = new Grumpy();
        expect(model.constructor.name).toEqual('DoItMyWay');
        expect(model.myWay).toBeTruthy();
      });
      
      it('should not interfere with subclassing', function() {
        var Dog = Coccyx.Model.extend({
          constructorName:'Dog',
          initialize: function() {
            this.species = 'dog'
          }
        });
        
        var Beagle = Dog.extend({
          constructorName:'Beagle',
          initialize: function() {
            Beagle.__super__.initialize.apply(this);
            this.breed = 'beagle'
          }
        });
        
        var dog = new Dog();
        expect(dog.species).toEqual('dog');
        expect(dog.constructor.name).toEqual('Dog');
        
        var beagle = new Beagle();
        expect(beagle.species).toEqual('dog');
        expect(beagle.breed).toEqual('beagle');
        expect(beagle.constructor.name).toEqual('Beagle');
      });
    });
    
    describe('when constructorName is not set', function() {
      var view;
      beforeEach(function() {
        view = new UnnamedCustomView();
      });
      
      it('should do nothing to the original constructor', function() {
        expect(view.constructor.name).toEqual('');
        expect(view.initialized).toBeTruthy();
      });

      describe('and enforceConstructorName is true', function() {
        it('should raise an error', function() {
          Coccyx.enforceConstructorName = true;
          expect(function() {
            var UnnamedCustomView = Coccyx.View.extend({});
          }).toThrow();
          Coccyx.enforceConstructorName = false;          
        });
      });     
    });
  })
});
