jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

var Deferred = require('./support/deferred');

function describeWithoutTravisCI(text, callback) {
  if (process.env.TRAVIS !== 'true') callback();
}

Object.assign(global, {
  describeWithoutTravisCI,
  Deferred
});