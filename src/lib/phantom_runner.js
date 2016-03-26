var system = require('system');
var webPage = require('webpage');
var args = system.args;

var port = args[1] || 8888;
var query = args[2];

var page = webPage.create();
page.onConsoleMessage = function(message) {
  system.stdout.write(message);
};
page.onCallback = function(json) {
  var result = JSON.parse(json);
  phantom.exit(result.success ? 0 : 1);
};

var url = 'http://localhost:' + port;
if (query) url += '/?' + query;
page.open(url);