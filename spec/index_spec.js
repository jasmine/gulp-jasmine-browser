require('./spec_helper');

describe('gulp-jasmine-browser', function() {
  var fs = require('fs');
  var path = require('path');
  var childProcess = require('child_process');
  var selenium = require('selenium-standalone');
  var webdriverio = require('webdriverio');

  function gulp(task, callback) {
    var gulpPath = path.resolve('node_modules', '.bin', 'gulp');
    var gulpFile = path.resolve(__dirname, 'fixtures', 'gulpfile.js');
    return childProcess.exec([gulpPath, '--gulpfile', gulpFile, task].join(' '),
      {timeout: 5000}, callback);

  }

  function withSelenium(callback) {
    selenium.install(function() {
      selenium.start(function(error, seleniumProcess) {
        callback(seleniumProcess, webdriverio.remote().init());
      });
    });
  }

  it('can run tests via PhantomJS', function(done) {
    var gulpProcess = gulp('phantomjs', function(error, stdout, stderr) {
      expect(error).toBeTruthy();
      expect(stderr).toBe('');
      expect(stdout).toContain('2 specs, 1 failure');
    });
    gulpProcess.on('close', done);
  });

  describeWithoutTravisCI('when not running on Travis CI', function() {
    describe('when a server is already running', function() {
      var gulpServerProcess;
      beforeEach(function(done) {
        gulpServerProcess = gulp('webpack-server');
        gulpServerProcess.stdout.on('data', function(chunk) {
          if (chunk.match(/listening on port/)) {
            done();
          }
        });
      });
      it('will re-use the server if available', function(done) {
        var gulpPhantomProcess = gulp('phantomjs', function(error, stdout, stderr) {
          expect(error).toBeTruthy();
          expect(stderr).toBe('');
          expect(stdout).toContain('2 specs, 1 failure');
        });

        gulpServerProcess.on('close', done);
        gulpPhantomProcess.on('close', function() {
          gulpServerProcess.kill();
        });
      });
    });

    it('allows running tests in a browser', function(done) {
      var gulpProcess = gulp('server');
      gulpProcess.on('close', done);
      withSelenium(function(seleniumServer, webdriver) {
        return webdriver
          .url('http://localhost:8888')
          .getText('.bar.failed', function(error, text) {
            expect(text).toBe('2 specs, 1 failure');
          })
          .end(function() {
            seleniumServer.kill();
            gulpProcess.kill();
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
            expect(text).toBe('2 specs, 1 failure');
          })
          .end(function() {
            seleniumServer.kill();
            gulpProcess.kill();
          });
      });
    });

    it('supports webpack with watch: true', function(done) {
      var mutableSpec = path.resolve(__dirname, 'fixtures', 'mutable_spec.js');
      var oldSpec = `it('makes a basic failing assertion', function() { expect(true).toBe(false); });`;
      var newSpec = `it('makes a basic passing assertion', function() { expect(true).toBe(true); });`;
      var gulpProcess = gulp('webpack-server');
      gulpProcess.on('close', function() {
        fs.writeSync(fs.openSync(mutableSpec, 'w'), oldSpec);
        done();
      });
      withSelenium(function(seleniumServer, webdriver) {

        webdriver.addCommand('waitForWebpack', function(cb) {
          gulpProcess.stdout.on('data', function(chunk) {
            if (chunk.match(/webpack is watching for changes/i)) {
              cb();
            }
          });
        });

        webdriver
          .url('http://localhost:8888')
          .getText('.bar.failed', function(error, text) {
            expect(text).toBe('1 spec, 1 failure');
          })
          .call(function() {
            fs.writeSync(fs.openSync(mutableSpec, 'w'), newSpec);
          })
          .waitForWebpack()
          .refresh()
          .getText('.bar.passed', function(error, text) {
            expect(text).toBe('1 spec, 0 failures');
          })
          .end(function() {
            seleniumServer.kill();
            gulpProcess.kill();
          });
      });
    });
  });
});
