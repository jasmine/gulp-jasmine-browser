require('./spec_helper');

describe('gulp-jasmine-browser', function() {
  const timeout = 5000;

  let fs, path, childProcess, processes;

  beforeEach(function() {
    processes = [];
    fs = require('fs');
    path = require('path');
    childProcess = require('child_process');
  });

  function gulp(task) {
    let resolveCompleted;
    const completed = new Promise(resolve => resolveCompleted = resolve);

    const gulpPath = path.resolve('node_modules', '.bin', 'gulp');
    const gulpFile = path.resolve(__dirname, 'fixtures', 'gulpfile.js');
    const process = childProcess.exec([gulpPath, '--gulpfile', gulpFile, task].join(' '),
      {timeout}, (error, stdout, stderr) => resolveCompleted({error, stdout, stderr}));

    const closed = new Promise(resolve => process.on('close', resolve));

    processes.push({process, closed});

    return {
      completed,
      process
    };
  }

  afterEach.async(async function() {
    (await Promise.all(processes)).filter(p => p.process).map(p => (p.process.kill(), p.closed));
  });

  describeWithoutTravisCI('when running a headless browser', () => {
    it.async('can run tests via PhantomJS', async function() {
      const {error, stdout, stderr} = await gulp('phantomjs').completed;
      expect(error).toBeTruthy();
      expect(stderr).toBe('');
      expect(stdout).toContain('.F');
    });

    it.async('can run tests via SlimerJS', async function() {
      const {error, stdout, stderr} = await gulp('slimerjs').completed;
      expect(error).toBeTruthy();
      expect(stderr).toBe('');
      expect(stdout).toContain('.F');
    });
  });

  describeWithoutTravisCI('when running in a browser', function() {
    describeWithWebdriver('when running with webdriver', () => {
      let page;
      it.async('allows running tests in a browser', async function() {
        gulp('server');
        page = (await visit('http://localhost:8888')).page;
        const text = await page.getText('.jasmine-bar.jasmine-failed');
        expect(text).toMatch('2 specs, 1 failure');
      });

      it.async('allows re-running tests in a browser', async function() {
        gulp('server');
        page = (await visit('http://localhost:8888')).page;
        const text = await page.url('http://localhost:8888').refresh().getText('.jasmine-bar.jasmine-failed');
        expect(text).toMatch('2 specs, 1 failure');
      });

      describe('when the file is mutated', function() {
        const oldSpec = 'it(\'makes a basic failing assertion\', function() { expect(true).toBe(false); });';
        const newSpec = 'it(\'makes a basic passing assertion\', function() { expect(true).toBe(true); });';
        let pathToMutableSpec;

        beforeEach(function() {
          pathToMutableSpec = path.resolve(__dirname, 'fixtures', 'mutable_spec.js');
        });

        afterEach(function(done) {
          fs.writeFile(pathToMutableSpec, oldSpec, done);
        });

        it.async('supports webpack with watch: true', async function() {
          const {process: gulpProcess} = gulp('webpack-server');
          page = (await visit('http://localhost:8888')).page;
          let text = await page.getText('.jasmine-bar.jasmine-failed');
          expect(text).toMatch('1 spec, 1 failure');
          function waitForWebpack() {
            return new Promise(resolve => {
              gulpProcess.stdout.on('data', chunk => chunk.match(/webpack is watching for changes/i) && resolve());
            });
          }
          fs.writeFileSync(pathToMutableSpec, newSpec);

          await waitForWebpack();
          text = await page.refresh().getText('.jasmine-bar.jasmine-passed');
          expect(text).toMatch('1 spec, 0 failures');
        });
      });
    });
  });
});
