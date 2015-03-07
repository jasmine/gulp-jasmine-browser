var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var jasmineCore = require('jasmine-core');

function resolveJasmineFiles(directoryProp, fileNamesProp) {
  var directory = jasmineCore.files[directoryProp];
  var fileNames = jasmineCore.files[fileNamesProp];
  return fileNames.map(function(fileName) { return path.resolve(directory, fileName); });
}

function SpecRunner(options) {
  File.call(this, {path: '/specRunner.html', base: '/'});

  options = Object(options);
  this.contents = new Buffer('<!DOCTYPE html>');
  this.files = {};

  resolveJasmineFiles('path', 'cssFiles').forEach(function(fileName) {
    this.inlineFile(fileName);
  }, this);
  resolveJasmineFiles('path', 'jsFiles').forEach(function(fileName) {
    this.inlineFile(fileName);
  }, this);
  if (options.console) {
    this.inlineFile('console.js');
    this.inlineFile('console_boot.js');
  } else {
    resolveJasmineFiles('bootDir', 'bootFiles').forEach(function(fileName) {
      this.inlineFile(fileName);
    }, this);
  }
}

SpecRunner.prototype = Object.create(File.prototype);

var inlineTagExtensions = {'.css': 'style', '.js': 'script'};
SpecRunner.prototype.inlineFile = function(filePath) {
  var fileContents = fs.readFileSync(path.resolve(__dirname, filePath), {encoding: 'utf8'});
  var fileExtension = inlineTagExtensions[path.extname(filePath)];

  this.contents = Buffer.concat([
    this.contents,
    new Buffer('<' + fileExtension + '>' + fileContents + '</' + fileExtension + '>')
  ]);
  return this;
};

SpecRunner.prototype.addFile = function(filePath) {
  if(this.files[filePath]) { return this; }
  this.files[filePath] = true;

  var fileExtension = path.extname(filePath);

  var html = '';
  if (fileExtension === '.js') {
    html = '<script src="' + filePath + '"></script>';
  } else if (fileExtension === '.css') {
    html = '<link href="' + filePath + '" rel="stylesheet" type="text/css"></link>';
  }

  this.contents = Buffer.concat([
    this.contents,
    new Buffer(html)
  ]);

  return this;
};

module.exports = SpecRunner;
