import lazypipe from 'lazypipe';
import {listen} from './server';
import path from 'path';
import qs from 'qs';
import {spawn} from 'child_process';
import {obj as through} from 'through2';
import {obj as reduce} from 'through2-reduce';
import ProfileReporter from 'jasmine-profile-reporter';
import TerminalReporter from 'jasmine-terminal-reporter';
import toReporter from 'jasmine-json-stream-reporter/to-reporter';
import split from 'split2';
import flatMap from 'flat-map';
import once from 'lodash.once';
import ChromDriver from './drivers/chrome';
import PhantomJsDriver from './drivers/phantomjs';
import PhantomJs1Driver from './drivers/phantomjs1';
import SlimerJsDriver from './drivers/slimerjs';
import portastic from 'portastic';

const DEFAULT_JASMINE_PORT = 8888;

const drivers = {
  chrome: ChromDriver,
  phantomjs: PhantomJsDriver,
  phantomjs1: PhantomJs1Driver,
  slimerjs: SlimerJsDriver,
  _default: PhantomJsDriver
};

function compact(array) {
  return array.filter(Boolean);
}

function onError(message) {
  try {
    const {PluginError} = require('gulp-util');
    return new PluginError('gulp-jasmine-browser', {message, showProperties: false});
  } catch(e) {
    return new Error(message);
  }
}

function getServer(files, options = {}) {
  const {findOpenPort, port = DEFAULT_JASMINE_PORT} = options;
  if (findOpenPort) return portastic.find({min: 8000, max: 8888, retrieve: 1}).then(([port]) => listen(port, files, options));
  return listen(port, files, options);
}

function defaultReporters(options, profile) {
  return compact([new TerminalReporter(options), profile && new ProfileReporter(options)]);
}

function createServer(options) {
  const {driver = 'phantomjs', random, throwFailures, spec, seed, reporter, profile, onCoverage, onSnapshot, onConsoleMessage = (...args) => console.log(...args), ...opts} = options;
  const query = qs.stringify({catch: options.catch, random, throwFailures, spec, seed});
  const {command, runner, output} = drivers[driver in drivers ? driver : '_default']();
  const stream = lazypipe()
    .pipe(() => reduce((memo, file) => (memo[file.relative] = file.contents, memo), {}))
    .pipe(() => through((files, enc, next) => getServer(files, options).then(i => next(null, i))))
    .pipe(() => flatMap(({server, port}, next) => {
      const stdio = ['pipe', output === 'stdout' ? 'pipe' : 1, output === 'stderr' ? 'pipe' : 2];
      const phantomProcess = spawn(command, compact([runner, port, query]), {cwd: path.resolve(__dirname), stdio});
      phantomProcess.on('close', () => server.close());
      ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => phantomProcess && phantomProcess.kill()));
      next(null, phantomProcess[output].pipe(split(null, JSON.parse, {objectMode: true})));
    }))
    .pipe(() => toReporter(reporter || defaultReporters(opts, profile), {onError, onConsoleMessage, onCoverage, onSnapshot}));
  return stream();
}

function createServerWatch(options) {
  const files = {};
  const createServerOnce = once(() => getServer(files, options));
  return lazypipe().pipe(() => {
    return through((file, enc, next) => {
      files[file.relative] = file.contents;
      createServerOnce();
      next(null, file);
    });
  })();
}

function headless(options = {}) {
  return createServer({findOpenPort: true, ...options});
}

function server(options = {}) {
  return createServerWatch(options);
}

function slimerjs(options = {}) {
  return headless({driver: 'slimerjs', ...options});
}

function phantomjs(options = {}) {
  return headless({driver: 'phantomjs', ...options});
}

function chrome(options = {}) {
  return headless({driver: 'chrome', ...options});
}

export {headless, server, slimerjs, phantomjs, chrome};