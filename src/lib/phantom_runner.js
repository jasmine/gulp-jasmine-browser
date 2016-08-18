var system = require('system');
var webPage = require('webpage');
var args = system.args;

var port = args[1] || 8888;
var query = args[2];

var page = webPage.create();
page.onConsoleMessage = function(message) {
  system.stdout.writeLine(message);
};
page.onCallback = function(result) {
  if (result.message) system.stderr.writeLine(result.message);
  if (result.exit) phantom.exit();
};

var url = 'http://localhost:' + port;
if (query) url += '/?' + query;
page.open(url);