var es = require('event-stream');
module.exports = function() {
  return {
    command: require('slimerjs').path,
    runner: 'slimer_runner.js',
    callback: function(server, phantomProcess) {
      phantomProcess.stdout.pipe(es.wait(function(err, body) {
        if (err) process.exit(err);
        var {success, buffer} = JSON.parse(body);
        console.log(buffer);
        process.exit(success ? 0 : 1);
      }));
    }
  };
};