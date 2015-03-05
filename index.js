'use strict';
var path = require('path');
var childProcess = require('child_process');
var reduce = require('through2-reduce');
var through = require('through2');
var phantomjs = require('phantomjs');
var express = require('express');
var SpecRunner = require('./lib/spec_runner');

exports.specRunner = function(options) {
  return reduce({objectMode: true}, function(specRunner, file) {
    return specRunner.addFile(file.path, file.contents);
  }, new SpecRunner(options));
};

exports.phantomjs = function() {
  return through.obj(function(specRunner, encoding, callback) {
    var phantomProcess = childProcess.spawn(phantomjs.path, ['phantom_runner.js'], {
      cwd: path.resolve(__dirname, 'lib'),
      stdio: 'pipe'
    });
    phantomProcess.on('close', function() { callback(); });
    specRunner.contents.pipe(phantomProcess.stdin);
    phantomProcess.stdout.pipe(process.stdout);
    phantomProcess.stderr.pipe(process.stderr);
    specRunner.contents.push(null);
  });
};

exports.server = function() {
  var savedSpecRunner = '';
  return through.obj(function(specRunner, encoding, callback) {
    specRunner.contents.on('data', function(chunk) { savedSpecRunner += chunk; });
    express()
      .get('/', function(req, res) { res.send(savedSpecRunner); })
      .listen(8888);
    specRunner.contents.push(null);
  });
};