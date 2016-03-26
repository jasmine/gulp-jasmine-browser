const seleniumStandalone = require('selenium-standalone');
const thenify = require('thenify');

module.exports = {
  install: thenify(seleniumStandalone.install),
  start: thenify(seleniumStandalone.start)
};
