head.js(
  // Jasmine
  "../externals/jasmine-1.2.0/jasmine.js",
  "../externals/jasmine-1.2.0/jasmine-html.js",

  // lib
  "../externals/jquery-1.7.2.js",
  "../externals/underscore.js",
  "../externals/backbone.js",

  // source
  "../Coccyx.js",

  // SpecHelper etc.
  "SpecHelper.js",
  "../JasmineCoccyx.js",

  // specs
  "spec/CoccyxTearDownSpec.js",
  "spec/CoccyxConstructorNameSpec.js", function() {
    var htmlReporter = new jasmine.HtmlReporter();
    var jasmineEnv = jasmine.getEnv();

    jasmineEnv.updateInterval = 1000;
    jasmineEnv.addReporter(htmlReporter);
    jasmineEnv.specFilter = function(spec) {
      return htmlReporter.specFilter(spec);
    };

    jasmineEnv.execute();
});
