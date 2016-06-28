const fs = require('fs');
const path = require('path');
const File = require('vinyl');
const jasmineCore = require('jasmine-core');

function resolveJasmineFiles(directoryProp, fileNamesProp) {
  const directory = jasmineCore.files[directoryProp];
  const fileNames = jasmineCore.files[fileNamesProp];
  return fileNames.map(fileName => path.resolve(directory, fileName));
}

const inlineTagExtensions = {'.css': 'style', '.js': 'script'};

const htmlForExtension = {
  '.js': filePath => `<script src="${filePath}"></script>`,
  '.css': filePath => `<link href="${filePath}" rel="stylesheet" type="text/css"></link>`,
  '_default': () => ''
};

const privates = new WeakMap();

class SpecRunner extends File {
  constructor(options = {}) {
    super({path: '/specRunner.html', base: '/'});

    this.contents = new Buffer('<!DOCTYPE html>');
    const {profile, console, sourcemappedStacktrace} = options;
    const useSourcemappedStacktrace = !console && sourcemappedStacktrace;
    privates.set(this, {files: new Set()});
    [
      ...resolveJasmineFiles('path', 'cssFiles'),
      useSourcemappedStacktrace && 'stylesheets/sourcemapped_stacktrace_reporter.css',
      ...resolveJasmineFiles('path', 'jsFiles'),
      profile && 'reporters/profile_reporter.js',
      ...(console ? ['reporters/console_reporter.js', 'console_boot.js'] : resolveJasmineFiles('bootDir', 'bootFiles')),
      profile && !console && 'reporters/add_profile_reporter.js',
      useSourcemappedStacktrace && require.resolve('sourcemapped-stacktrace/dist/sourcemapped-stacktrace.js'),
      useSourcemappedStacktrace && 'reporters/add_sourcemapped_stacktrace_reporter.js'
    ].filter(Boolean).forEach(fileName => this.inlineFile(fileName));
  }

  inlineFile(filePath) {
    const fileContents = fs.readFileSync(path.resolve(__dirname, filePath), {encoding: 'utf8'});
    const fileExtension = inlineTagExtensions[path.extname(filePath)];
    this.contents = Buffer.concat([
      this.contents,
      new Buffer(`<${fileExtension}>${fileContents}</${fileExtension}>`)
    ]);
    return this;
  }

  addFile(filePath) {
    const {files} = privates.get(this);
    if (files.has(filePath)) return this;
    files.add(filePath);
    const fileExtension = path.extname(filePath);
    this.contents = Buffer.concat([
      this.contents,
      new Buffer(htmlForExtension[fileExtension in htmlForExtension ? fileExtension : '_default'](filePath))
    ]);
    return this;
  }
}

module.exports = SpecRunner;
