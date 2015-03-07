'use strict';
//(c) Copyright 2015 Pivotal Software, Inc. All Rights Reserved.
var path = require('path');
var childProcess = require('child_process');
var portfinder = require('portfinder');
var through = require('through2');
var express = require('express');
var SpecRunner = require('./lib/spec_runner');

var DEFAULT_JASMINE_PORT = 8888;

function startNewServer(port, stream, files, callback) {
  var app = express();
  var server = app.listen(port, function() {
    console.log('Jasmine server listening on port ' + port);
    callback && callback(server, port);
    stream.next();
  });
  app.get('/', function(req, res) {
    res.redirect('/specRunner.html')
  });
  app.get('*', function(req, res) {
    res.send(files[req.path].toString());
  });
}

function getServer(options, files, stream, callback) {
  var port = options && options.port || DEFAULT_JASMINE_PORT;

  if(options && options.reUse) {
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
    files[file.path] = file.contents;
    if(stream.allowedToContinue) {
      done();
    }
    stream.next = function() {
      stream.allowedToContinue = true;
      done();
    }
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
    this.push(specRunner.addFile(file.path));
    callback();
  });
};

exports.phantomjs = function(options) {
  options = Object.create(options || {});
  if(typeof options.reUse === 'undefined') {
    options.reUse = true;
  }
  var stream = createServer(options, function(server, port) {
    stream.on('end', function() {
      var phantomProcess = childProcess.spawn('phantomjs', ['phantom_runner.js', port], {
        cwd: path.resolve(__dirname, 'lib'),
        stdio: 'pipe'
      });
      phantomProcess.on('close', function() {
        server && server.close();
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