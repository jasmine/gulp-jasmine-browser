'use strict';
var path = require('path');
var childProcess = require('child_process');
var through = require('through2');
var express = require('express');
var SpecRunner = require('./lib/spec_runner');

var DEFAULT_JASMINE_PORT = 8888;

function createServer(options) {
  var port = options && options.port || DEFAULT_JASMINE_PORT;

  var files = {};
  var stream = through.obj(function(file, encoding, callback) {
    files[file.path] = file.contents;
    callback();
  });
  stream.pause();

  var app = express();
  var server = app.listen(port, function() {
    stream.resume();
  });
  app.get('/', function(req, res) {
    res.redirect('/specRunner.html')
  });
  app.get('*', function(req, res) {
    res.send(files[req.path].toString());
  });
  return {stream: stream, server: server};
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
  var port = options && options.port || DEFAULT_JASMINE_PORT;

  var container = createServer(options);
  container.stream.on('end', function() {
    var phantomProcess = childProcess.spawn('phantomjs', ['phantom_runner.js', port], {
      cwd: path.resolve(__dirname, 'lib'),
      stdio: 'pipe'
    });
    phantomProcess.on('close', function() {
      container.server.close();
    });
    phantomProcess.stdout.pipe(process.stdout);
    phantomProcess.stderr.pipe(process.stderr);
  });
  return container.stream;
};

exports.server = function(options) {
  return createServer(options).stream;
};