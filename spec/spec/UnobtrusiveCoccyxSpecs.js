coccyxTearDownSpecs(Coccyx);
coccyxConstructorNameSpecs(Coccyx);

describe('Unobtrusive Coccyx does not monkey-patch Backbone', function() {
  describe("Backbone Views", function() {
    it("should not manage view hierarchies", function() {
      var view = new Backbone.View();
      expect(view.tearDown).toBeFalsy();      
      expect(view.registerSubview).toBeFalsy();
    });
  });

  describe("Backbone Event", function() {
    it("should not attempt to register the event dispatcher with the passed in context", function() {
      var context = {};
      context.registerEventDispatcher = jasmine.createSpy();
      var eventDispatcher = _.extend({}, Backbone.Events);
      eventDispatcher.on('add', function() {}, context);
      expect(context.registerEventDispatcher).not.toHaveBeenCalled();
    });
  })
});