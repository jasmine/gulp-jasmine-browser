const JasmineWebdriver = require('./jasmine_webdriver');

let webdriver;

function visit(url) {
  return webdriver.driver().then(({driver}) => {
    return driver.url(url).then(() => ({page: driver}));
  });
}

function describeWithWebdriver(name, callback, options = {}) {
  describe(name, function() {
    beforeEach(() => {
      webdriver = webdriver || new JasmineWebdriver({timeout: 5000, ...options});
    });

    afterEach(async function(done) {
      await webdriver.end();
      done();
    });

    callback();
  });
}

module.exports = {describeWithWebdriver, visit};