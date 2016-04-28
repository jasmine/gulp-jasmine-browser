module.exports = function() {
  return {
    get command() {
      try {
        return require('phantomjs-prebuilt').path;
      } catch(e) {
        try {
          return require('phantomjs').path;
        } catch(e) {
          return 'phantomjs';
        }
      }
    },
    runner: 'phantom_runner.js',
    run(phantomProcess) {
      return new Promise((resolve, reject) => {
        phantomProcess.once('close', function(code) {
          if (code) return reject(code);
          resolve(code);
        });
        phantomProcess.stdout.pipe(process.stdout);
        phantomProcess.stderr.pipe(process.stderr);
      });
    }
  };
};