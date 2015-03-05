var path = require('path');
var childProcess = require('child_process');
var selenium = require('selenium-standalone');
var webdriverio = require('webdriverio');

function gulp(task, callback) {
  return childProcess.exec([
    'node_modules/.bin/gulp',
    '--gulpfile', path.resolve(__dirname, 'fixtures', 'gulpfile.js'),
    task
  ].join(' '), callback);
}

function withSelenium(callback) {
  selenium.install(function() {
    selenium.start(function(error, seleniumProcess) {
      callback(seleniumProcess, webdriverio.remote().init());
    })
  });
}

describe('gulp-jasmine-browser', function() {
  it('can run tests via PhantomJS', function(done) {
    gulp('phantomjs', function(error, stdout, stderr) {
      expect(error).toBe(null);
      expect(stderr).toBe('');
      expect(stdout).toContain('2 specs, 1 failure');
      done();
    });
  });

  it('allows running tests in a browser', function(done) {
    var gulpProcess = gulp('server');
    withSelenium(function(seleniumServer, webdriver) {
      return webdriver
        .url('http://localhost:8888')
        .getText('.bar.failed', function(error, text) {
          expect(text).toBe('2 specs, 1 failure')
        })
        .end(function() {
          seleniumServer.kill();
          gulpProcess.kill();
          done();
        });
    });
  });

  it('allows re-running tests in a browser', function(done) {
    var gulpProcess = gulp('server');
    withSelenium(function(seleniumServer, webdriver) {
      return webdriver
        .url('http://localhost:8888')
        .refresh()
        .getText('.bar.failed', function(error, text) {
          expect(text).toBe('2 specs, 1 failure')
        })
        .end(function() {
          seleniumServer.kill();
          gulpProcess.kill();
          done();
        });
    });
  });
});
