const lazypipe = require('lazypipe');
const {listen} = require('./server');
const once = require('lodash.once');
const path = require('path');
const portfinder = require('portfinder');
const qs = require('qs');
const reduce = require('stream-reduce');
const {spawn} = require('child_process');
const thenify = require('thenify');
const {obj: through} = require('through2');

const getPort = thenify(portfinder.getPort);

const DEFAULT_JASMINE_PORT = 8888;

const drivers = {
  phantomjs: require('./drivers/phantomjs'),
  phantomjs1: require('./drivers/phantomjs1'),
  slimerjs: require('./drivers/slimerjs'),
  _default: require('./drivers/phantomjs')
};

function getServer(files, options = {}) {
  const {findOpenPort, port = DEFAULT_JASMINE_PORT} = options;
  if (findOpenPort) return getPort().then(port => listen(port, files, options));
  return listen(port, files, options);
}

function createServer(options) {
  let {driver = 'phantomjs', random, throwFailures, spec, seed} = options;
  const query = qs.stringify({catch: options.catch, random, throwFailures, spec, seed});
  const {command, runner, run} = drivers[driver in drivers ? driver : '_default']();
  const stream = lazypipe().pipe(() => {
    return reduce(function(memo, file) {
      memo[file.relative] = file.contents;
      return memo;
    }, {});
  }).pipe(() => {
    return through(async function(files, enc, next) {
      const {server, port} = await getServer(files, options);
      next(null, {server, port});
    });
  }).pipe(() => {
    return through(async function({server, port}, enc, next) {
      this.pause();
      const phantomProcess = spawn(command, [runner, port, query], {cwd: path.resolve(__dirname), stdio: 'pipe'});
      ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => phantomProcess && phantomProcess.kill()));
      try {
        await run(phantomProcess);
      } catch(e) {
        this.emit('error', 'Tests failed');
      } finally{
        this.resume();
        server.close();
        this.push(null);
        next();
      }
    }, () => {});
  });
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