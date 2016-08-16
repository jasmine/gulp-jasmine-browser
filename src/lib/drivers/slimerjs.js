const {obj: reduce} = require('through2-reduce');
const {obj: spy} = require('through2-spy');
const pipe = require('multipipe');

module.exports = function() {
  return {
    get command() {
      try {
        return require('slimerjs').path;
      } catch(e) {
        return 'slimerjs';
      }
    },
    runner: 'slimer_runner.js',
    run(phantomProcess) {
      return new Promise((resolve, reject) => {
        pipe(
          phantomProcess.stdout,
          reduce((memo, data) => memo + data, ''),
          spy(body => {
            const {success, buffer} = JSON.parse(body);
            console.log(buffer);
            if (!success) return reject(success);
            resolve(success);
          }),
          err => err && reject(err)
        );
      });
    }
  };
};