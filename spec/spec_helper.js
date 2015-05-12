jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

var Deferred = require('./support/deferred');

function describeWithoutTravisCI(text, callback) {
  callback();
}

Object.assign(global, {
  describeWithoutTravisCI,
  Deferred
});