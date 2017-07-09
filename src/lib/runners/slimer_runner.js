var system = require('system');
var webPage = require('webpage');
var args = system.args;

var port = args[1] || 8888;
var query = args[2];

var page = webPage.create();
page.onCallback = function(result) {
  if (result.message) system.stdout.writeLine(result.message);
  if (result.exit) slimer.exit(0);
};
page.onConsoleMessage = function() {
  page.onCallback({message: JSON.stringify({id: ':consoleMessage', message: Array.prototype.slice.call(arguments, 0).join('')})});
};

var url = 'http://localhost:' + port + '/consoleRunner';
if (query) url += '/?' + query;
page.open(url);