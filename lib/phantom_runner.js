var system = require('system');
var webPage = require('webpage');

var page = webPage.create();
page.onConsoleMessage = function(message) {
  system.stdout.write(message);
};
page.onCallback = function(success) {
  phantom.exit(success ? 0 : 1);
};

var buffer = [];
while (!system.stdin.atEnd()) {
  buffer.push(system.stdin.readLine());
}

page.setContent(buffer.join('\n'), 'http://localhost');
