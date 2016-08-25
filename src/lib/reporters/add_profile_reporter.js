(function() {
  if (window.JasmineProfileReporter) {
    var profileReporter = new JasmineProfileReporter({
      print: function(message) { console.log(message); }
    });
    jasmine.getEnv().addReporter(profileReporter);
  }
})();
