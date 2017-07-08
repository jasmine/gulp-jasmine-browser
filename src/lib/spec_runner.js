import File from 'vinyl';
import {files as jasmineCoreFiles} from 'jasmine-core';
import {readFileSync} from 'fs';
import {resolve, extname} from 'path';

function resolveJasmineFiles(directoryProp, fileNamesProp) {
  const directory = jasmineCoreFiles[directoryProp];
  const fileNames = jasmineCoreFiles[fileNamesProp];
  return fileNames.map(fileName => resolve(directory, fileName));
}

const inlineTagExtensions = {'.css': 'style', '.js': 'script'};

const htmlForExtension = {
  '.js': filePath => `<script src="${filePath}"></script>`,
  '.css': filePath => `<link href="${filePath}" rel="stylesheet" type="text/css"></link>`,
  '_default': () => ''
};

const privates = new WeakMap();

export default class SpecRunner extends File {
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
      profile && require.resolve('jasmine-profile-reporter/browser.js'),
      ...(console ? [require.resolve('jasmine-json-stream-reporter/browser.js'), 'boot.js'] : resolveJasmineFiles('bootDir', 'bootFiles')),
      profile && !console && 'reporters/add_profile_reporter.js',
      useSourcemappedStacktrace && require.resolve('sourcemapped-stacktrace/dist/sourcemapped-stacktrace.js'),
      useSourcemappedStacktrace && 'reporters/add_sourcemapped_stacktrace_reporter.js'
    ].filter(Boolean).forEach(fileName => this.inlineFile(fileName));
  }

  inlineFile(filePath) {
    const fileContents = readFileSync(resolve(__dirname, filePath), {encoding: 'utf8'});
    const fileExtension = inlineTagExtensions[extname(filePath)];
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
    const fileExtension = extname(filePath);
    this.contents = Buffer.concat([
      this.contents,
      new Buffer(htmlForExtension[fileExtension in htmlForExtension ? fileExtension : '_default'](filePath))
    ]);
    return this;
  }
}