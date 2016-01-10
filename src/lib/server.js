const express = require('express');
const mime = require('mime');
const path = require('path');
const favicon = require('serve-favicon');

function log(message) {
  try {
    const {log} = require('gulp-util');
    log(message);
  } catch(e) {
    console.log(message);
  }
}

function renderFile(res, files, pathname, whenReady) {
  whenReady()
    .then(function() {
      let contents;
      if (pathname && (contents = files[pathname])) {
        res.status(200).type(mime.lookup(pathname)).send(contents.toString());
        return;
      }
      res.status(404).send('File not Found');
    }, function() {
      renderFile(res, files, pathname, whenReady);
    });
}

const Server = {
  createServer(files, options = {}) {
    const app = express();

    app.use(favicon(path.join(__dirname, '..', 'public', 'jasmine_favicon.png')));

    app.get('/', function(req, res) {
      const {whenReady = () => Promise.resolve()} = options;
      renderFile(res, files, 'specRunner.html', whenReady);
    });

    app.get('*', function(req, res) {
      const {whenReady = () => Promise.resolve()} = options;
      const filePath = req.path.replace(/^\//, '');
      const pathname = path.normalize(filePath);
      renderFile(res, files, pathname, whenReady);
    });

    return app;
  },

  listen(port, files, options = {}) {
    return new Promise(resolve => {
      const server = Server.createServer(files, options).listen(port, function() {
        log(`Jasmine server listening on port ${port}`);
        resolve({server, port});
      });
    });
  }
};

module.exports = Server;