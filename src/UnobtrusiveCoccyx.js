//     UnobtrusiveCoccyx.js 0.4.0

//     (c) 2012 Onsi Fakhouri
//     Coccyx.js may be freely distributed under the MIT license.
//     http://github.com/onsi/coccyx

(function() {
//include:CoccyxBase.js
  
  Coccyx.Events = _.extend({}, Backbone.Events);
  _.each(klassNames, function(klassName) {
    Coccyx[klassName] = Backbone[klassName].extend({});
  });

  coccyxify(Coccyx);
})();