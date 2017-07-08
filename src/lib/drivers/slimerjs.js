export default function slimerJs() {
  return {
    get command() {
      try {
        return require('slimerjs').path;
      } catch(e) {
        return 'slimerjs';
      }
    },
    runner: 'slimer_runner.js',
    output: 'stdout'
  };
}