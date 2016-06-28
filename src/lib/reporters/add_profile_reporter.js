(function() {
  if (jasmineRequire.profile) {
    window.jasmine = window.jasmine || jasmineRequire.core(jasmineRequire);
    jasmineRequire.profile(jasmineRequire, jasmine);
    var profileReporter = new jasmine.ProfileReporter({
      print: function(message) { console.log(message); }
    });
    jasmine.getEnv().addReporter(profileReporter);
  }
})();
