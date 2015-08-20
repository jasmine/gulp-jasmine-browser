var es = require('event-stream');
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
        phantomProcess.stdout.pipe(es.wait(function(err, body) {
          if (err) return reject(err);
          var {success, buffer} = JSON.parse(body);
          console.log(buffer);
          if (!success) return reject(success);
          resolve(success);
        }));
      });
    }
  };
};