(function() {
  function injectQueryParams(env, QueryString, SpecFilter) {
    //TODO: test query params
    
    var queryString = new QueryString({
      getWindowLocation: function() { return window.location; }
    });

    var catchingExceptions = queryString.getParam('catch');
    env.catchExceptions(typeof catchingExceptions === 'undefined' ? true : catchingExceptions);

    var throwingExpectationFailures = queryString.getParam('throwFailures');
    env.throwOnExpectationFailure(throwingExpectationFailures);

    var random = queryString.getParam('random');
    env.randomizeTests(random);

    var seed = queryString.getParam('seed');
    if (seed) {
      env.seed(seed);
    }

    var specFilter = new SpecFilter({
      filterString: function() { return queryString.getParam('spec'); }
    });

    env.specFilter = function(spec) {
      return specFilter.matches(spec.getFullName());
    };
  }

  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

  window.jasmine = window.jasmine || jasmineRequire.core(jasmineRequire);

  var env = jasmine.getEnv();
  injectQueryParams(env, jasmineRequire.QueryString(), jasmineRequire.HtmlSpecFilter());

  var jasmineInterface = jasmineRequire.interface(jasmine, env);

  extend(window, jasmineInterface);

  var buffer = '';
  var success;
  var done = 0;
  var activeReporters = 0;

  if (jasmineRequire.console) {
    jasmineRequire.console(jasmineRequire, jasmine);
    var consoleReporter = new jasmine.ConsoleReporter({
      showColors: true,
      timer: new jasmine.Timer(),
      print: function(message) { buffer += message; console.log(message); },
      onComplete: function(s) {
        success = s;
        done++;
      }
    });

    env.addReporter(consoleReporter);
    activeReporters++;
  }

  if (jasmineRequire.profile) {
    jasmineRequire.profile(jasmineRequire, jasmine);
    var profileReporter = new jasmine.ProfileReporter({
      print: function(message) { buffer += message; console.log(message); },
      onComplete: function() {
        done++;
      }
    });
    env.addReporter(profileReporter);
    activeReporters++;
  }

  var currentWindowOnload = window.onload;
  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    env.execute();
  };

  function spinLock() {
    setTimeout(function() {
      if (done !== activeReporters) return spinLock();
      callPhantom(JSON.stringify({success: success, buffer: buffer}));
      buffer = '';
    }, 0);
  }
  spinLock();
})();
