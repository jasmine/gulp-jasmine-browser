var headless = require('./lib/headless');
var through = require('through2');
var SpecRunner = require('./lib/spec_runner');

module.exports = Object.assign({
  specRunner(options) {
    var specRunner = new SpecRunner(options);
    return through.obj(function(file, encoding, callback) {
      this.push(file);
      this.push(specRunner.addFile(file.relative));
      callback();
    });
  }
}, headless);