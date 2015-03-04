var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var jasmineCore = require('jasmine-core');
var SpecRunner = require('../lib/spec_runner');

var jasmineJsFiles = jasmineCore.files.jsFiles.map(function(fileName) {
  return fs.readFileSync(path.resolve(jasmineCore.files.path, fileName), 'utf8');
});
var jasmineCssFiles = jasmineCore.files.cssFiles.map(function(fileName) {
  return fs.readFileSync(path.resolve(jasmineCore.files.path, fileName), 'utf8');
});
var jasmineBootFiles = jasmineCore.files.bootFiles.map(function(fileName) {
  return fs.readFileSync(path.resolve(jasmineCore.files.bootDir, fileName), 'utf8');
});
var consoleJs = fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'console.js'), 'utf8');
var consoleBootJs = fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'console_boot.js'), 'utf8');

function readStream(stream, callback) {
  stream.push(null);

  var result = '';
  stream.on('data', function(chunk) {
    result += chunk;
  });

  stream.on('end', function() {
    callback(result);
  });
}

describe('SpecRunner', function() {
  var specRunnerFile;
  beforeEach(function() {
    specRunnerFile = new SpecRunner({console: true});
  });

  it('includes all of the Jasmine library files', function(done) {
    readStream(specRunnerFile.contents, function(html) {
      jsdom.env({
        html: html,
        done: function(errors, window) {
          var tags = window.document.querySelectorAll('script,style');
          var tagContents = Object.keys(tags).map(function(index) {
            return tags[index].innerHTML;
          });

          expect(tags.length).toBe(6);

          expect(tagContents[0]).toBe(jasmineCssFiles[0]);
          expect(tags[0] instanceof window.HTMLStyleElement).toBeTruthy();

          expect(tagContents[1]).toBe(jasmineJsFiles[0]);
          expect(tags[1] instanceof window.HTMLScriptElement).toBeTruthy();

          expect(tagContents[2]).toBe(jasmineJsFiles[1]);
          expect(tags[2] instanceof window.HTMLScriptElement).toBeTruthy();

          expect(tagContents[3]).toBe(jasmineJsFiles[2]);
          expect(tags[3] instanceof window.HTMLScriptElement).toBeTruthy();

          expect(tagContents[4]).toBe(consoleJs);
          expect(tags[4] instanceof window.HTMLScriptElement).toBeTruthy();

          expect(tagContents[5]).toBe(consoleBootJs);
          expect(tags[5] instanceof window.HTMLScriptElement).toBeTruthy();

          done();
        }
      });
    });
  });

  it('allows adding additional css and js files', function() {
    specRunnerFile.addFile('foo.js', 'window.foo = 1 + 1');
    specRunnerFile.addFile('bar.css', 'body { font-size: 16px; }');

    readStream(specRunnerFile.contents, function(html) {
      jsdom.env({
        html: html,
        done: function(errors, window) {
          var tags = window.document.querySelectorAll('script,style');
          var tagContents = Object.keys(tags).map(function(index) {
            return tags[index].innerHTML;
          });

          expect(tags.length).toBe(8);

          expect(tagContents[6]).toBe('window.foo = 1 + 1');
          expect(tags[6] instanceof window.HTMLScriptElement).toBeTruthy();

          expect(tagContents[7]).toBe('body { font-size: 16px; }');
          expect(tags[7] instanceof window.HTMLStyleElement).toBeTruthy();

          done();
        }
      });
    });
  });
});