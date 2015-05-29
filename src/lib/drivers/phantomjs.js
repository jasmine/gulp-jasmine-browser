module.exports = function() {
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
};