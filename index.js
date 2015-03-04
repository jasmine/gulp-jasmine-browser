'use strict';
var path = require('path');
var childProcess = require('child_process');
var reduce = require('through2-reduce');
var through = require('through2');
var phantomjs = require('phantomjs');
//var express = require('express');
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
      stdio: ['pipe', 'inherit', 'inherit']
    });
    phantomProcess.on('close', function() { callback(); });
    specRunner.contents.pipe(phantomProcess.stdin);
    specRunner.contents.push(null);
  });
};

//function jasmineServer(options) {
//  var app;
//  var files = {};
//  options = Object(options);
//  specRunner = options.specRunner || specRunner;
//
//  function createServer() {
//    var app = express();
//    var port = options.port || 8888;
//
//    app.get('/', function(req, res) {
//      res.type('html').status(200).send(specRunner(files));
//    });
//
//    //app.listen(port, () => console.log(`Jasmine server listening on ${port}`));
//    return app;
//  }
//
//  return through.obj(function(file, enc, callback) {
//    files[path.basename(file.path)] = file.contents;
//    this.push(file);
//    if (!app) app = createServer();
//    callback();
//  });
//}
