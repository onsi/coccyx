(function() {
  var old_tearDown = Coccyx.View.prototype._tearDown;
  Coccyx.View.prototype._tearDown = function() {
    this.__tornDown = true;
    return old_tearDown.apply(this, arguments);
  }
})();

beforeEach(function() {
  this.addMatchers({
    toHaveBeenTornDown: function(expected) {
      var actual = this.actual;
      var notText = this.isNot ? " not" : "";

      this.message = function () {
        return "Expected " + actual + notText + " to have been torn down.";
      }

      return !!actual.__tornDown;
    },

    toHaveRegisteredSubView: function(expected) {
      var actual = this.actual;
      var notText = this.isNot ? " not" : "";

      this.message = function () {
        return "Expected " + actual + notText + " to have subview " + expected;
      }

      return actual.subViews[expected.cid] === expected;
    }
  });
});
