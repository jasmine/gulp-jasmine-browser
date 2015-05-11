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

module.exports = {
  specRunner(options) {
    var specRunner = new SpecRunner(options);
    return through.obj(function(file, encoding, callback) {
      this.push(file);
      this.push(specRunner.addFile(file.relative));
      callback();
    });
  },

  phantomjs(options = {}) {
    options = Object.assign({findOpenPort: true}, options);
    var stream = createServer(options, function(server, port) {
      stream.on('end', function() {
        var phantomProcess = childProcess.spawn('phantomjs', ['phantom_runner.js', port], {
          cwd: path.resolve(__dirname, 'lib'),
          stdio: 'pipe'
        });
        phantomProcess.on('close', function(code) {
          server && server.close();
          process.exit(code);
        });
        phantomProcess.stdout.pipe(process.stdout);
        phantomProcess.stderr.pipe(process.stderr);
      });
    });
    return stream;
  },

  server(options) {
    return createServer(options);
  }
};