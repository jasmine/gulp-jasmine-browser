require('./spec_helper');

describe('gulp-jasmine-browser', function() {
  const timeout = 5000;

  var fs, path, childProcess, selenium, webdriverio, processes;

  beforeEach(function() {
    processes = [];
    fs = require('fs');
    path = require('path');
    childProcess = require('child_process');
    selenium = require('selenium-standalone');
    webdriverio = require('webdriverio');
  });

  function gulp(task) {
    var resolveCompleted;
    var completed = new Promise(resolve => resolveCompleted = resolve);

    var gulpPath = path.resolve('node_modules', '.bin', 'gulp');
    var gulpFile = path.resolve(__dirname, 'fixtures', 'gulpfile.js');
    var process = childProcess.exec([gulpPath, '--gulpfile', gulpFile, task].join(' '),
      {timeout}, (error, stdout, stderr) => resolveCompleted({error, stdout, stderr}));

    var closed = new Promise(resolve => process.on('close', resolve));

    processes.push({process, closed});

    return {
      completed,
      process
    };
  }

  function getWebdriver() {
    return new Promise(function(resolve, reject) {
      selenium.install(function() {
        selenium.start(function(error, process) {
          if (error) return reject(error);
          processes.push({process, closed: new Promise(res => process.on('close', res))});
          var webdriver = webdriverio.remote({desiredCapabilities: {browserName: 'phantomjs'}}).init();
          processes.push({webdriver});
          resolve({webdriver});
        });
      });
    });
  }

  afterEach(async function(done) {
    console.log(4444);
    await* processes.filter(p => p.webdriver).map(p => p.webdriver.end());
    console.log(5555);
    await* processes.filter(p => p.process).map(p => (p.process.kill(), p.closed));
    done();
  });

  it('can run tests via PhantomJS', async function(done) {
    var {error, stdout, stderr} = await gulp('phantomjs').completed;
    expect(error).toBeTruthy();
    expect(stderr).toBe('');
    expect(stdout).toContain('2 specs, 1 failure');
    done();
  });

  it('allows running tests in a browser', async function(done) {
    gulp('server');
    var {webdriver} = await getWebdriver();
    var text = await webdriver.url('http://localhost:8888').getText('.bar.failed');
    expect(text).toBe('2 specs, 1 failure');
    done();
  });

  it('allows re-running tests in a browser', async function(done) {
    gulp('server');
    var {webdriver} = await getWebdriver();
    var text = await webdriver.url('http://localhost:8888').refresh().getText('.bar.failed');
    expect(text).toBe('2 specs, 1 failure');
    done();
  });

  describe('when the file is mutated', function() {
    const oldSpec = `it('makes a basic failing assertion', function() { expect(true).toBe(false); });`;
    const newSpec = `it('makes a basic passing assertion', function() { expect(true).toBe(true); });`;
    var pathToMutableSpec;

    beforeEach(function() {
      pathToMutableSpec = path.resolve(__dirname, 'fixtures', 'mutable_spec.js');
    });

    afterEach(function(done) {
      fs.writeFile(pathToMutableSpec, oldSpec, done);
    });

    it('supports webpack with watch: true', async function(done) {
      var {process: gulpProcess} = gulp('webpack-server');

      console.log(1111);
      var {webdriver} = await getWebdriver();
      webdriver.addCommand('waitForWebpack', function(cb) {
        gulpProcess.stdout.on('data', chunk => chunk.match(/webpack is watching for changes/i) && cb());
      });

      console.log(2222);
      var text = await webdriver.url('http://localhost:8888').refresh().getText('.bar.failed');
      expect(text).toBe('1 spec, 1 failure');
      fs.writeFileSync(pathToMutableSpec, newSpec);
      console.log(3333);
      text = await webdriver.waitForWebpack().refresh().getText('.bar.passed');
      expect(text).toBe('1 spec, 0 failures');
      done();
    });
  });
});
