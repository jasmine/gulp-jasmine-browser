var express = require('express');
var mime = require('mime');
var path = require('path');

function log(message) {
  try {
    var {log} = require('gulp-util');
    log(message);
  } catch(e) {
    console.log(message);
  }
}

function renderFile(res, files, pathname, whenReady) {
  whenReady()
    .then(function() {
      var contents;
      if (pathname && (contents = files[pathname])) {
        res.status(200).type(mime.lookup(pathname)).send(contents.toString());
        return;
      }
      res.status(404).send('File not Found');
    }, function() {
      renderFile(res, files, pathname, whenReady);
    });
}

var Server = {
  createServer(files, options = {}) {
    var app = express();
    app.get('/', function(req, res) {
      var {whenReady = () => Promise.resolve()} = options;
      renderFile(res, files, 'specRunner.html', whenReady);
    });

    app.get('*', function(req, res) {
      var {whenReady = () => Promise.resolve()} = options;
      var filePath = req.path.replace(/^\//, '');
      var pathname = path.normalize(filePath);
      renderFile(res, files, pathname, whenReady);
    });

    return app;
  },

  listen(port, stream, files, callback, options = {}) {
    var server = Server.createServer(files, options).listen(port, function() {
      log(`Jasmine server listening on port ${port}`);
      callback && callback(server, port);
      stream.next();
    });
    return server;
  }
};

module.exports = Server;