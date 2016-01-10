const headless = require('./lib/headless');
const through = require('through2');
const SpecRunner = require('./lib/spec_runner');

module.exports = Object.assign({
  specRunner(options) {
    const specRunner = new SpecRunner(options);
    return through.obj(function(file, encoding, callback) {
      this.push(file);
      this.push(specRunner.addFile(file.relative));
      callback();
    });
  }
}, headless);