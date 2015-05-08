var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var jasmineCore = require('jasmine-core');

function resolveJasmineFiles(directoryProp, fileNamesProp) {
  var directory = jasmineCore.files[directoryProp];
  var fileNames = jasmineCore.files[fileNamesProp];
  return fileNames.map(fileName => path.resolve(directory, fileName));
}

function SpecRunner(options = {}) {
  File.call(this, {path: '/specRunner.html', base: '/'});

  this.contents = new Buffer('<!DOCTYPE html>');
  this.files = {};

  var files = [].concat(
    resolveJasmineFiles('path', 'cssFiles'),
    resolveJasmineFiles('path', 'jsFiles'),
    options.console ? ['console.js', 'console_boot.js'] : resolveJasmineFiles('bootDir', 'bootFiles')
  );
  files.forEach(fileName => this.inlineFile(fileName));
}

SpecRunner.prototype = Object.create(File.prototype);

var inlineTagExtensions = {'.css': 'style', '.js': 'script'};
SpecRunner.prototype.inlineFile = function(filePath) {
  var fileContents = fs.readFileSync(path.resolve(__dirname, filePath), {encoding: 'utf8'});
  var fileExtension = inlineTagExtensions[path.extname(filePath)];

  this.contents = Buffer.concat([
    this.contents,
    new Buffer(`<${fileExtension}>${fileContents}</${fileExtension}>`)
  ]);
  return this;
};

SpecRunner.prototype.addFile = function(filePath) {
  if (this.files[filePath]) return this;
  this.files[filePath] = true;

  var fileExtension = path.extname(filePath);

  var html = '';
  if (fileExtension === '.js') {
    html = `<script src="${filePath}"></script>`;
  } else if (fileExtension === '.css') {
    html = `<link href="${filePath}" rel="stylesheet" type="text/css"></link>`;
  }

  this.contents = Buffer.concat([
    this.contents,
    new Buffer(html)
  ]);

  return this;
};

module.exports = SpecRunner;
