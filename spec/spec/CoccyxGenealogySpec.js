var GrandmotherView = Backbone.View.extend({
  constructorName: 'GrandmotherView'
});

var MotherView = Backbone.View.extend();

var SonView = Backbone.View.extend({
  constructorName: 'SonView'
});

var DaughterView = Backbone.View.extend({
  constructorName: 'DaughterView'
});

var GranddaughterView = Backbone.View.extend();

describe('Coccyx', function() {
  var grandmotherView, motherView, sonView, daughterView, granddaughterView;

  beforeEach(function() {
    grandmotherView = new GrandmotherView();
    motherView = new MotherView();
    sonView = new sonView();
    daughterView = new daughterView();
    granddaughterView = new GranddaughterView();
    
    grandmotherView.registerSubView(motherView);
    motherView.registerSubView(sonView);
    motherView.registerSubView(daughterView);
    daughterView.registerSubView(granddaughterView);
  });

  describe('descendsFrom?', function() {
    it('should return true if it descends from a view with the given constructorName', function() {
		expect(granddaughterView.descendsFrom?('DaughterView')).toBeTruthy();
    });
    
    it('and it should not matter if intermediate ancestors have no constructorName', function() {
		expect(granddaughterView.descendsFrom?('GrandmotherView')).toBeTruthy();    
    });
    
    it('should return false if it does not descend from a view with the given constructorName', function() {
		expect(granddaughterView.descendsFrom?('SonView')).toBeFalsy();        
    });
  });
});