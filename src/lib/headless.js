import lazypipe from 'lazypipe';
import {listen} from './server';
import {resolve} from 'path';
import {stringify} from 'qs';
import {spawn} from 'child_process';
import {obj as through} from 'through2';
import {obj as reduce} from 'through2-reduce';
import ProfileReporter from 'jasmine-profile-reporter';
import TerminalReporter from 'jasmine-terminal-reporter';
import toReporter from 'jasmine-json-stream-reporter/to-reporter';
import split from 'split2';
import flatMap from 'flat-map';
import once from 'lodash.once';
import ChromeDriver from './drivers/chrome';
import PhantomJsDriver from './drivers/phantomjs';
import PhantomJs1Driver from './drivers/phantomjs1';
import SlimerJsDriver from './drivers/slimerjs';
import portastic from 'portastic';
import {compact, parse} from './helper';

const DEFAULT_JASMINE_PORT = 8888;

const drivers = {
  chrome: ChromeDriver,
  phantomjs: PhantomJsDriver,
  phantomjs1: PhantomJs1Driver,
  slimerjs: SlimerJsDriver,
  _default: PhantomJsDriver
};

function onError(message) {
  try {
    const {PluginError} = require('gulp-util');
    return new PluginError('gulp-jasmine-browser', {message, showProperties: false});
  } catch(e) {
    return new Error(message);
  }
}

function findPort() {
  return portastic.find({min: 8000, max: DEFAULT_JASMINE_PORT, retrieve: 1}).then(([port]) => port);
}

function startServer(files, options) {
  const {port} = options;
  if (!port) return findPort().then(port => listen(port, files, options));
  return listen(port, files, options);
}

function defaultReporters(options, profile) {
  return compact([new TerminalReporter(options), profile && new ProfileReporter(options)]);
}

function findOrStartServer(options) {
  function helper(port, streamPort, files) {
    let serverPromise, streamPortPromise;
    if (!port) serverPromise = startServer(files, options);
    else serverPromise = portastic.test(port).then(isOpen => {
      if (!isOpen) return {server: {close: () => {}}, port};
      return startServer(files, options);
    });
    if (!streamPort) streamPortPromise = findPort();
    else streamPortPromise = Promise.resolve(streamPort);
    return Promise.all([serverPromise, streamPortPromise]);
  }

  return through((files, enc, next) => helper(options.port, options.streamPort, files)
    .then(i => next(null, i)).catch(next));
}

function createServer(options) {
  const {driver = 'phantomjs', file, random, throwFailures, spec, seed, reporter, profile, onCoverage, onSnapshot,
    onConsoleMessage = (...args) => console.log(...args), withSandbox, ...opts} = options;
  const query = stringify({catch: options.catch, file, random, throwFailures, spec, seed});
  const {command, runner, output} = drivers[driver in drivers ? driver : '_default']();
  const stream = lazypipe()
    .pipe(() => reduce((memo, file) => (memo[file.relative] = file.contents, memo), {}))
    .pipe(() => findOrStartServer(options))
    .pipe(() => flatMap(([{server, port}, streamPort], next) => {
      const stdio = ['pipe', output === 'stdout' ? 'pipe' : 1, output === 'stderr' ? 'pipe' : 2];
      const env = {...process.env};
      env.STREAM_PORT = streamPort;
      withSandbox && (env.WITH_SANDBOX = true);
      const phantomProcess = spawn(command, compact([runner, port, query]), {cwd: resolve(__dirname, './runners'), env, stdio});
      phantomProcess.on('close', () => server.close());
      ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => phantomProcess && phantomProcess.kill()));
      next(null, phantomProcess[output].pipe(split(parse)));
    }))
    .pipe(() => toReporter(reporter || defaultReporters(opts, profile), {onError, onConsoleMessage, onCoverage, onSnapshot}));
  return stream();
}

function createServerWatch(options) {
  const files = {};
  const createServerOnce = once(() => startServer(files, options));
  return lazypipe().pipe(() => {
    return through((file, enc, next) => {
      files[file.relative] = file.contents;
      createServerOnce();
      next(null, file);
    });
  })();
}

function headless(options = {}) {
  return createServer(options);
}

function server(options = {}) {
  return createServerWatch({port: DEFAULT_JASMINE_PORT, ...options});
}

const [slimerjs, phantomjs, chrome] = ['slimerjs', 'phantomjs', 'chrome'].map(driver => {
  return function(options = {}) {
    return headless({...options, driver});
  };
});

export {headless, server, slimerjs, phantomjs, chrome};