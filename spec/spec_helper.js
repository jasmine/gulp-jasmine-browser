jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

function describeWithoutTravisCI(text, callback) {
  callback();
}

var Deferred = require('./support/deferred');

Object.assign(global, {
  describeWithoutTravisCI,
  Deferred
});