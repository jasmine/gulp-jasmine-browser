jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

function describeWithoutTravisCI(text, callback) {
  callback();
}

Object.assign(global, {
  describeWithoutTravisCI
});