var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var jasmineCore = require('jasmine-core');

function resolveJasmineFiles(directoryProp, fileNamesProp) {
  var directory = jasmineCore.files[directoryProp];
  var fileNames = jasmineCore.files[fileNamesProp];
  return fileNames.map(fileName => path.resolve(directory, fileName));
}

const inlineTagExtensions = {'.css': 'style', '.js': 'script'};

var privates = new WeakMap();
class SpecRunner extends File {
  constructor(options = {}) {
    super({path: '/specRunner.html', base: '/'});

    this.contents = new Buffer('<!DOCTYPE html>');
    privates.set(this, {files: new Set()});

    var files = [].concat(
      resolveJasmineFiles('path', 'cssFiles'),
      resolveJasmineFiles('path', 'jsFiles'),
      options.console ? ['console.js', 'console_boot.js'] : resolveJasmineFiles('bootDir', 'bootFiles')
    );
    files.forEach(fileName => this.inlineFile(fileName));
  }

  inlineFile(filePath) {
    var fileContents = fs.readFileSync(path.resolve(__dirname, filePath), {encoding: 'utf8'});
    var fileExtension = inlineTagExtensions[path.extname(filePath)];

    this.contents = Buffer.concat([
      this.contents,
      new Buffer(`<${fileExtension}>${fileContents}</${fileExtension}>`)
    ]);
    return this;
  }

  addFile(filePath) {
    var {files} = privates.get(this);
    if (files.has(filePath)) return this;
    files.add(filePath);

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
  }
}

module.exports = SpecRunner;
