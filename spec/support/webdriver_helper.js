import JasmineWebdriver from './jasmine_webdriver';

let webdriver;

export function visit(url) {
  return webdriver.driver().then(({driver}) => {
    return driver.url(url).then(() => ({page: driver}));
  });
}

export function describeWithWebdriver(name, callback, options = {}) {
  describe(name, function() {
    beforeEach(() => {
      webdriver = webdriver || new JasmineWebdriver({timeout: 5000, ...options});
    });

    afterEach.async(async function() {
      await webdriver.end();
    });

    callback();
  });
}