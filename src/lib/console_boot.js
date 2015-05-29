(function() {
  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

  window.jasmine = jasmineRequire.core(jasmineRequire);
  jasmineRequire.console(jasmineRequire, jasmine);

  var env = jasmine.getEnv();
  var jasmineInterface = jasmineRequire.interface(jasmine, env);

  extend(window, jasmineInterface);

  var buffer = '';
  var consoleReporter = new jasmine.ConsoleReporter({
    showColors: true,
    timer: new jasmine.Timer(),
    print: function(message) { buffer += message; console.log(message); },
    onComplete: function(success) {
      callPhantom(JSON.stringify({success: success, buffer: buffer}));
    }
  });

  env.addReporter(consoleReporter);

  var currentWindowOnload = window.onload;
  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    env.execute();
  };
})();
