const lazypipe = require('lazypipe');
const server = require('./server');
const once = require('lodash.once');
const path = require('path');
const portfinder = require('portfinder');
const qs = require('qs');
const childProcess = require('child_process');
const thenify = require('thenify');
const {obj: through} = require('through2');
const {obj: reduce} = require('through2-reduce');
const ProfileReporter = require('jasmine-profile-reporter');
const TerminalReporter = require('jasmine-terminal-reporter');
const toReporter = require('jasmine-json-stream-reporter/to-reporter');
const split = require('split2');
const flatMap = require('flat-map');

const getPort = thenify(portfinder.getPort);

const DEFAULT_JASMINE_PORT = 8888;

const drivers = {
  phantomjs: require('./drivers/phantomjs'),
  phantomjs1: require('./drivers/phantomjs1'),
  slimerjs: require('./drivers/slimerjs'),
  _default: require('./drivers/phantomjs')
};

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
  if (findOpenPort) return getPort().then(port => server.listen(port, files, options));
  return server.listen(port, files, options);
}

function defaultReporters(options, profile) {
  return [new TerminalReporter(options), profile && new ProfileReporter(options)].filter(Boolean);
}

function createServer(options = {}) {
  const {driver = 'phantomjs', random, throwFailures, spec, seed, reporter, profile, onCoverage, onConsoleMessage = (...args) => console.log(...args), ...opts} = options;
  const query = qs.stringify({catch: options.catch, random, throwFailures, spec, seed});
  const {command, runner, output} = drivers[driver in drivers ? driver : '_default']();
  const stream = lazypipe()
    .pipe(() => reduce((memo, file) => (memo[file.relative] = file.contents, memo), {}))
    .pipe(() => through((files, enc, next) => getServer(files, options).then(i => next(null, i))))
    .pipe(() => flatMap(({server, port}, next) => {
      const stdio = ['pipe', output === 'stdout' ? 'pipe' : 1, output === 'stderr' ? 'pipe' : 2];
      const args = [runner, port, query];
      options.ignoreSslErrors && args.splice(0, 0, '--ignore-ssl-errors=true');
      const phantomProcess = childProcess.spawn(command, args, {cwd: path.resolve(__dirname), stdio});
      phantomProcess.on('close', () => server.close());
      ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => phantomProcess && phantomProcess.kill()));
      next(null, phantomProcess[output].pipe(split(null, JSON.parse, {objectMode: true})));
    }))
    .pipe(() => toReporter(reporter || defaultReporters(opts, profile), {onError, onConsoleMessage, onCoverage}));
  return stream();
}

function createServerWatch(options) {
  const files = {};
  const createServerOnce = once(() => getServer(files, options));
  return lazypipe().pipe(() => {
    return through((file, enc, next) => {
      files[file.relative] = file.contents;
      createServerOnce();
      next(null, files);
    });
  })();
}

function headless(options = {}) {
  return createServer({findOpenPort: true, ...options});
}

module.exports = {
  headless,

  server(options = {}) {
    return createServerWatch(options);
  },

  slimerjs(options = {}) {
    return headless({driver: 'slimerjs', ...options});
  },

  phantomjs(options = {}) {
    return headless({driver: 'phantomjs', ...options});
  }
};