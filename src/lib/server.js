import express from 'express';
import mime from 'mime';
import path from 'path';
import favicon from 'serve-favicon';
import {PassThrough} from 'stream';

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
      pathname = decodeURIComponent(pathname);
      if (pathname && files[pathname]) {
        res.status(200).type(mime.lookup(pathname));
        const stream = new PassThrough();
        stream.end(files[pathname]);
        stream.pipe(res);
        return;
      }
      res.status(404).send('File not Found');
    }, function() {
      renderFile(res, files, pathname, whenReady);
    });
}

function createServer(files, options = {}) {
  const app = express();

  app.use(favicon(path.resolve(__dirname, '..', 'public', 'jasmine_favicon.png')));

  app.get('/', function(req, res) {
    const {whenReady = () => Promise.resolve()} = options;
    renderFile(res, files, 'specRunner.html', whenReady);
  });

  app.get('/consoleRunner', function(req, res) {
    const {whenReady = () => Promise.resolve()} = options;
    renderFile(res, files, 'consoleRunner.html', whenReady);
  });

  app.get('*', function(req, res) {
    const {whenReady = () => Promise.resolve()} = options;
    const filePath = req.path.replace(/^\//, '');
    const pathname = path.normalize(filePath);
    renderFile(res, files, pathname, whenReady);
  });

  return app;
}

function listen(port, files, options = {}) {
  return new Promise(resolve => {
    const server = createServer(files, options).listen(port, function() {
      log(`Jasmine server listening on port ${port}`);
      resolve({server, port});
    });
  });
}

export {createServer, listen};