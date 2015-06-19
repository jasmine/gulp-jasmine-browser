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
    callback(server, phantomProcess) {
      phantomProcess.stdout.pipe(es.wait(function(err, body) {
        if (err) process.exit(err);
        var {success, buffer} = JSON.parse(body);
        console.log(buffer);
        process.exit(success ? 0 : 1);
      }));
    }
  };
};