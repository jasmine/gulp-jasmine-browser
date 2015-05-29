var path = require('path');
var childProcess = require('child_process');
var {listen} = require('./server');
var portfinder = require('portfinder');
var promisify = require('es6-promisify');
var through = require('through2');

var getPort = promisify(portfinder.getPort);

/* eslint-disable no-unused-vars */
const DEFAULT_JASMINE_PORT = 8888;
/* eslint-enable no-unused-vars */

const drivers = {
  phantomjs: require('./drivers/phantomjs'),
  slimerjs: require('./drivers/slimerjs'),
  _default: require('./drivers/phantomjs')
};

async function getServer(files, stream, callback, options = {}) {
  var {findOpenPort, port = DEFAULT_JASMINE_PORT} = options;

  if (findOpenPort) {
    try {
      port = await getPort();
    } catch (e) {
      callback(e);
    }
  }
  listen(port, stream, files, callback, options);
}

function createServer(options, callback = null) {
  var files = {};
  var stream = through.obj(function(file, encoding, done) {
    files[file.relative] = file.contents;
    if(stream.allowedToContinue) {
      done();
    }
    stream.next = function() {
      stream.allowedToContinue = true;
      done();
    };
  });
  stream.next = function() {
    stream.allowedToContinue = true;
  };

  getServer(files, stream, callback, options);

  return stream;
}

function headless(options = {}) {
  options = Object.assign({findOpenPort: true}, options);
  var {driver = 'phantomjs'} = options;
  var {command, runner, callback} = drivers[driver in drivers ? driver : '_default']();
  console.log(command, runner);
  var stream = createServer(options, function(server, port) {
    stream.on('end', function() {
      var phantomProcess = childProcess.spawn(command, [runner, port], {
        cwd: path.resolve(__dirname),
        stdio: 'pipe'
      });
      ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => phantomProcess && phantomProcess.kill()));
      callback(server, phantomProcess);
    });
  });
  return stream;
}

module.exports = {
  headless,

  server(options = {}) {
    return createServer(options);
  },

  slimerjs(options = {}) {
    return headless(Object.assign({}, options, {driver: 'slimerjs'}));
  },

  phantomjs(options = {}) {
    return headless(Object.assign({}, options, {driver: 'phantomjs'}));
  }
};