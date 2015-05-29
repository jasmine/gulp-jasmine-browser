var system = require('system');
var webPage = require('webpage');
var args = system.args;

var port = args[1] || 8888;

var page = webPage.create();
page.onCallback = function(json) {
  console.log(json);
  slimer.exit();
};

page.open('http://localhost:' + port);