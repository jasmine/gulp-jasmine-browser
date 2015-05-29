var es = require('event-stream');
var path = require('path');
var childProcess = require('child_process');
var portfinder = require('portfinder');
var promisify = require('es6-promisify');
var through = require('through2');
var SpecRunner = require('./lib/spec_runner');
var {listen} = require('./lib/server');

var getPort = promisify(portfinder.getPort);

/* eslint-disable no-unused-vars */
const DEFAULT_JASMINE_PORT = 8888;
/* eslint-enable no-unused-vars */

function phantomjs() {
  return {
    command: 'phantomjs',
    runner: 'phantom_runner.js',
    callback: function(server, phantomProcess) {
      phantomProcess.once('close', function(code) {
        server && server.close();
        process.exit(code);
      });
      phantomProcess.stdout.pipe(process.stdout);
      phantomProcess.stderr.pipe(process.stderr);
    }
  };
}

function slimerjs() {
  return {
    command: require('slimerjs').path,
    runner: 'slimer_runner.js',
    callback: function(server, phantomProcess) {
      phantomProcess.stdout.pipe(es.wait(function(err, body) {
        if (err) process.exit(err);
        var {success, buffer} = JSON.parse(body);
        console.log(buffer);
        process.exit(success ? 0 : 1);
      }));
    }
  };
}

const drivers = {
  phantomjs,
  slimerjs,
  _default: phantomjs
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

function createServer(options = {}, callback = null) {
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

var GulpJasmineBrowser = {
  specRunner(options) {
    var specRunner = new SpecRunner(options);
    return through.obj(function(file, encoding, callback) {
      this.push(file);
      this.push(specRunner.addFile(file.relative));
      callback();
    });
  },

  headless(options = {}) {
    options = Object.assign({findOpenPort: true}, options);
    var {driver = 'phantomjs'} = options;
    var {command, runner, callback} = drivers[driver in drivers ? driver : '_default']();
    var stream = createServer(options, function(server, port) {
      stream.on('end', function() {
        var phantomProcess = childProcess.spawn(command, [runner, port], {
          cwd: path.resolve(__dirname, 'lib'),
          stdio: 'pipe'
        });
        ['SIGINT', 'SIGTERM'].forEach(e => process.once(e, () => phantomProcess && phantomProcess.kill()));
        callback(server, phantomProcess);
      });
    });
    return stream;
  },

  slimerjs(options = {}) {
    return GulpJasmineBrowser.headless(Object.assign({}, options, {driver: 'slimerjs'}));
  },

  phantomjs(options = {}) {
    return GulpJasmineBrowser.headless(Object.assign({}, options, {driver: 'phantomjs'}));
  },

  server(options) {
    return createServer(options);
  }
};

module.exports = GulpJasmineBrowser;