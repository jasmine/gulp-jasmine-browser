'use strict';
//(c) Copyright 2015 Pivotal Software, Inc. All Rights Reserved.
var path = require('path');
var childProcess = require('child_process');
var mime = require('mime');
var portfinder = require('portfinder');
var through = require('through2');
var express = require('express');
var SpecRunner = require('./lib/spec_runner');

var DEFAULT_JASMINE_PORT = 8888;

function startNewServer(port, stream, files, callback) {
  function renderFile(res, pathname) {
    var contents;
    if (pathname && (contents = files[pathname])) {
      res.status(200).type(mime.lookup(pathname)).send(contents.toString());
      return;
    }
    res.status(404).send('File not Found');
  }
  var app = express();
  var server = app.listen(port, function() {
    console.log('Jasmine server listening on port ' + port);
    callback && callback(server, port);
    stream.next();
  });
  app.get('/', function(req, res) {
    renderFile(res, 'specRunner.html');
  });
  app.get('*', function(req, res) {
    var filePath = req.path.replace(/^\//, '');
    var pathname = path.normalize(filePath);
    renderFile(res, pathname);
  });
}

function getServer(options, files, stream, callback) {
  var port = options && options.port || DEFAULT_JASMINE_PORT;

  if(options && options.findOpenPort) {
    portfinder.getPort(function(err, port) {
      if (err) return callback(err);
      startNewServer(port, stream, files, callback);
    });
  } else {
    startNewServer(port, stream, files, callback);
  }
}

function createServer(options, callback) {
  options = Object.create(options || {});

  var files = {};
  var stream = through.obj(function(file, encoding, done) {
    files[file.relative] = file.contents;
    if(stream.allowedToContinue) {
      done();
    }
    stream.next = function() {
      stream.allowedToContinue = true;
      done();
    };
  });
  stream.next = function() {
    stream.allowedToContinue = true;
  };

  getServer(options, files, stream, callback);

  return stream;
}

exports.specRunner = function(options) {
  var specRunner = new SpecRunner(options);
  return through.obj(function(file, encoding, callback) {
    this.push(file);
    this.push(specRunner.addFile(file.relative));
    callback();
  });
};

exports.phantomjs = function(options) {
  options = Object.create(options || {});
  if(typeof options.findOpenPort === 'undefined') {
    options.findOpenPort = true;
  }
  var stream = createServer(options, function(server, port) {
    stream.on('end', function() {
      var phantomProcess = childProcess.spawn('phantomjs', ['phantom_runner.js', port], {
        cwd: path.resolve(__dirname, 'lib'),
        stdio: 'pipe'
      });
      phantomProcess.on('close', function(code) {
        server && server.close();
        process.exit(code);
      });
      phantomProcess.stdout.pipe(process.stdout);
      phantomProcess.stderr.pipe(process.stderr);
    });
  });
  return stream;
};

exports.server = function(options) {
  return createServer(options);
};