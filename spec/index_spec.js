var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var selenium = require('selenium-standalone');
var webdriverio = require('webdriverio');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

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
    });
  });
}

describe('gulp-jasmine-browser', function() {
  xit('can run tests via PhantomJS', function(done) {
    var gulpProcess = gulp('phantomjs', function(error, stdout, stderr) {
      expect(error).toBe(null);
      expect(stderr).toBe('');
      expect(stdout).toContain('2 specs, 1 failure');
      gulpProcess.kill('SIGKILL');
    });
    gulpProcess.on('close', done);
  });

  it('allows running tests in a browser', function(done) {
    var gulpProcess = gulp('server');
    gulpProcess.on('close', done);
    withSelenium(function(seleniumServer, webdriver) {
      return webdriver
        .url('http://localhost:8888')
        .getText('.bar.failed', function(error, text) {
          expect(text).toBe('2 specs, 1 failure')
        })
        .end(function() {
          seleniumServer.kill();
          gulpProcess.kill('SIGKILL');
        });
    });
  });

  it('allows re-running tests in a browser', function(done) {
    var gulpProcess = gulp('server');
    gulpProcess.on('close', done);
    withSelenium(function(seleniumServer, webdriver) {
      return webdriver
        .url('http://localhost:8888')
        .refresh()
        .getText('.bar.failed', function(error, text) {
          expect(text).toBe('2 specs, 1 failure')
        })
        .end(function() {
          seleniumServer.kill();
          gulpProcess.kill('SIGKILL');
        });
    });
  });

  it('supports webpack with watch: true', function(done) {
    var mutableSpec = path.resolve(__dirname, 'fixtures', 'mutable_spec.js');
    var oldSpec = "" +
      "it('makes a basic failing assertion'," +
      "function() { expect(true).toBe(false); " +
      "});";
    var newSpec = "" +
      "it('makes a basic passing assertion'," +
      "function() { expect(true).toBe(true); " +
      "});";
    var gulpProcess = gulp('webpack-server');
    gulpProcess.on('close', function() {
      fs.writeSync(fs.openSync(mutableSpec, 'w'), oldSpec);
      done();
    });
    withSelenium(function(seleniumServer, webdriver) {

      webdriver.addCommand("waitForWebpack", function(cb) {
        gulpProcess.stdout.on('data', function(chunk) {
          if (chunk.match(/Webpack is watching for changes/)) {
            cb();
          }
        });
      });

      webdriver
        .url('http://localhost:8888')
        .getText('.bar.failed', function(error, text) {
          expect(text).toBe('1 spec, 1 failure')
        })
        .call(function() {
          fs.writeSync(fs.openSync(mutableSpec, 'w'), newSpec);
        })
        .waitForWebpack()
        .refresh()
        .getText('.bar.passed', function(error, text) {
          expect(text).toBe('1 spec, 0 failures')
        })
        .end(function() {
          seleniumServer.kill();
          gulpProcess.kill('SIGKILL');
        });
    });
  });
});
