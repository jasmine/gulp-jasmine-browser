jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

var Deferred = require('./support/deferred');

Object.assign(global, {
  Deferred
});