const Deferred = require('./support/deferred');
const {DEFAULT_TIMEOUT_INTERVAL} = jasmine;

function describeWithoutTravisCI(text, callback) {
  if (process.env.TRAVIS !== 'true') callback();
}

const globals = {
  describeWithoutTravisCI,
  Deferred,
  ...require('./support/webdriver_helper')
};
Object.assign(global, globals);

beforeEach(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
});

afterAll(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = DEFAULT_TIMEOUT_INTERVAL;
  Object.keys(globals).forEach(key => delete global[key]);
  delete require.cache[require.resolve(__filename)];
});