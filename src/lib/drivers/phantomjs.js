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
    output: 'stderr'
  };
};