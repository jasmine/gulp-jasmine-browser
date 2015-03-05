'use strict';
var path = require('path');
var childProcess = require('child_process');
var through = require('through2');
var express = require('express');
var SpecRunner = require('./lib/spec_runner');

exports.specRunner = function(options) {
  var specRunner = new SpecRunner(options);
  return through.obj(function(file, encoding, callback) {
    this.push(file);
    this.push(specRunner.addFile(file.path));
    callback();
  });
};

exports.phantomjs = function() {
  var app = express();
  var server = app.listen(8888);
  app.get('/', function(req, res) {
    res.redirect('/specRunner.html')
  });
  return through.obj(function(file, encoding, callback) {
    app.get(file.path, function(req, res) {
      res.send(file.contents.toString());
    });
    callback();
  }, function(callback) {
    var phantomProcess = childProcess.spawn('phantomjs', ['phantom_runner.js'], {
      cwd: path.resolve(__dirname, 'lib'),
      stdio: 'pipe'
    });
    phantomProcess.on('close', function() {
      callback();
      server.close();
    });
    phantomProcess.stdout.pipe(process.stdout);
    phantomProcess.stderr.pipe(process.stderr);
  });
};

exports.server = function() {
  var app = express();
  var files = {};
  app.listen(8888);
  app.get('/', function(req, res) {
    res.redirect('/specRunner.html')
  });
  app.get('*', function(req, res) {
    res.send(files[req.path].toString());
  });
  return through.obj(function(file, encoding, callback) {
    files[file.path] = file.contents;
    callback();
  });
};