var fs = require('fs');
var path = require('path');
var stream = require('stream');
var File = require('vinyl');
var jasmineCore = require('jasmine-core');

function resolveJasmineFiles(directoryProp, fileNamesProp) {
  var directory = jasmineCore.files[directoryProp];
  var fileNames = jasmineCore.files[fileNamesProp];
  return fileNames.map(function(fileName) { return path.resolve(directory, fileName); });
}

function SpecRunner(options) {
  File.call(this, {path: 'spec_runner.html'});

  options = Object(options);
  this.contents = new stream.Readable();
  this.contents._read = function() {};
  this.contents.push('<!DOCTYPE html>');

  resolveJasmineFiles('path', 'cssFiles').forEach(function(fileName) {
    this.addFile(fileName);
  }, this);
  resolveJasmineFiles('path', 'jsFiles').forEach(function(fileName) {
    this.addFile(fileName);
  }, this);
  if (options.console) {
    this.addFile('console.js');
    this.addFile('console_boot.js');
  } else {
    resolveJasmineFiles('bootDir', 'bootFiles').forEach(function(fileName) {
      this.addFile(fileName);
    }, this);
  }
}

SpecRunner.prototype = Object.create(File.prototype);

var tagExtensions = {'.css': 'style', '.js': 'script'};
SpecRunner.prototype.addFile = function(filePath, fileContents) {
  fileContents = fileContents || fs.readFileSync(path.resolve(__dirname, filePath), {encoding: 'utf8'});
  var fileExtension = tagExtensions[path.extname(filePath)];
  this.contents.push('<' + fileExtension + '>' + fileContents + '</' + fileExtension + '>');
  return this;
};

module.exports = SpecRunner;
