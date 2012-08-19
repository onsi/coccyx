var GrandmotherView = Backbone.View.extend({
  constructorName: 'GrandmotherView'
});

var MotherView = Backbone.View.extend({});

var SonView = Backbone.View.extend({
  constructorName: 'SonView'
});

var DaughterView = Backbone.View.extend({
  constructorName: 'DaughterView'
});

var GranddaughterView = Backbone.View.extend({});

describe('Coccyx', function() {
  var grandmotherView, motherView, sonView, daughterView, granddaughterView;

  beforeEach(function() {
    grandmotherView = new GrandmotherView();
    motherView = new MotherView();
    sonView = new SonView();
    daughterView = new DaughterView();
    granddaughterView = new GranddaughterView();
    
    grandmotherView.registerSubView(motherView);
    motherView.registerSubView(sonView);
    motherView.registerSubView(daughterView);
    daughterView.registerSubView(granddaughterView);
  });

  describe('hasAncestorNamed', function() {
    it('should return true if it has an ancestor with the given constructorName', function() {
		expect(granddaughterView.hasAncestorNamed('DaughterView')).toBeTruthy();
    });
    
    it('should not matter if intermediate ancestors have no constructorName', function() {
		expect(granddaughterView.hasAncestorNamed('GrandmotherView')).toBeTruthy();    
    });
    
    it('should return false if it has no ancestor with the given constructorName', function() {
		expect(granddaughterView.hasAncestorNamed('SonView')).toBeFalsy();        
    });
  });
  
  describe('hasAncestor', function() {
    var otherDaughterView;
  
    beforeEach(function() {
      otherDaughterView = new DaughterView();
      motherView.registerSubView(otherDaughterView);
    });
  
    it('should return true if the given view is an ancestor', function() {
      expect(granddaughterView.hasAncestor(daughterView)).toBeTruthy();
      expect(granddaughterView.hasAncestor(motherView)).toBeTruthy();
      expect(granddaughterView.hasAncestor(grandmotherView)).toBeTruthy();
    });
    
    it('should return false if the given view is not an ancestor', function() {
      expect(granddaughterView.hasAncestor(sonView)).toBeFalsy();
    });
    
    it('should not matter if the given view has the same constructorName as an ancestor', function() {
      expect(granddaughterView.hasAncestor(otherDaughterView)).toBeFalsy();
    });
  });
});