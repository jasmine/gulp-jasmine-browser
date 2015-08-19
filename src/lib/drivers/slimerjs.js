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
    callback(server, phantomProcess, done) {
      phantomProcess.stdout.pipe(es.wait(function(err, body) {
        if (err) return done(err);
        var {success, buffer} = JSON.parse(body);
        console.log(buffer);
        done(success);
      }));
    }
  };
};