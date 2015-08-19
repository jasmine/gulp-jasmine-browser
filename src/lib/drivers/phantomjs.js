module.exports = function() {
  return {
    get command() {
      try {
        return require('phantomjs').path;
      } catch(e) {
        return 'phantomjs';
      }
    },
    runner: 'phantom_runner.js',
    callback(server, phantomProcess, done) {
      phantomProcess.once('close', function(code) {
        server && server.close();
        done(!code);
      });
      phantomProcess.stdout.pipe(process.stdout);
      phantomProcess.stderr.pipe(process.stderr);
    }
  };
};