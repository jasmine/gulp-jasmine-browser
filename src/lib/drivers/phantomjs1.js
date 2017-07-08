export default function phantomJs1() {
  return {
    get command() {
      try {
        return require('phantomjs').path;
      } catch(e) {
        return 'phantomjs';
      }
    },
    runner: 'phantom_runner.js',
    output: 'stderr'
  };
}