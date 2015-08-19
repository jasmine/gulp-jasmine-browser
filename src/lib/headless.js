var es = require('event-stream');
var {spawn} = require('child_process');
var lazypipe = require('lazypipe');
var {listen} = require('./server');
var path = require('path');
var portfinder = require('portfinder');
var promisify = require('es6-promisify');
var reduce = require('stream-reduce');
var once = require('lodash.once');

var getPort = promisify(portfinder.getPort);
var noop = () => {};

/* eslint-disable no-unused-vars */
const DEFAULT_JASMINE_PORT = 8888;
/* eslint-enable no-unused-vars */

const drivers = {
  phantomjs: require('./drivers/phantomjs'),
  slimerjs: require('./drivers/slimerjs'),
  _default: require('./drivers/phantomjs')
};

function getServer(files, options = {}) {
  var {findOpenPort, port = DEFAULT_JASMINE_PORT} = options;
  if (findOpenPort) return getPort().then(port => listen(port, files, options));
  return listen(port, files, options);
}

function createServer(options, lazy) {
  var stream = lazypipe().pipe(() => {
    return reduce(function(memo, file) {
      memo[file.relative] = file.contents;
      return memo;
    }, {});
  }).pipe(() => {
    return es.map(async function(files, callback) {
      var {server, port} = await getServer(files, options);
      callback(null, {server, port});
    });
  });
  if (lazy) stream = stream.pipe(() => lazy);
  return stream();
}

function createServerWatch(options) {
  var files = {};
  var createServerOnce = once(() => getServer(files, options));
  return lazypipe().pipe(() => {
    return es.map(function(file, callback) {
      files[file.relative] = file.contents;
      createServerOnce();
      callback(null, files);
    });
  })();
}

function headless(options = {}) {
  options = {findOpenPort: true, ...options};
  var {driver = 'phantomjs'} = options;
  var {command, runner, callback} = drivers[driver in drivers ? driver : '_default']();
  return createServer(options, es.through(function({server, port}) {
    var phantomProcess = spawn(command, [runner, port], {cwd: path.resolve(__dirname), stdio: 'pipe'});
    ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => phantomProcess && phantomProcess.kill()));
    callback(server, phantomProcess, success => {
      server.close();
      if (!success) this.emit('error', 'Tests failed');
      this.emit('end');
    });
  }, noop));
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