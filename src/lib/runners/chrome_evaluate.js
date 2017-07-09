module.exports = function() {
  return new Promise(function(resolve) {
    const output = [];
    window.callPhantom = function(result) {
      if (result.message) output.push(result.message);
      if (result.exit) return resolve(output);
    };
    jasmine.getEnv().execute();
  });
};