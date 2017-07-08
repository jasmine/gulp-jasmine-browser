import Deferred from './support/deferred';
import {visit, describeWithWebdriver} from './support/webdriver_helper';
import JasmineAsync from 'jasmine-async-suite';
import {withUnhandledRejection} from './support/unhandled_rejection_helper';

const {DEFAULT_TIMEOUT_INTERVAL} = jasmine;

JasmineAsync.install();

function describeWithoutTravisCI(text, callback) {
  if (process.env.TRAVIS !== 'true') callback();
}

function timeout(duration = 0) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

beforeEach(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
});

afterAll(() => {
  JasmineAsync.uninstall();
  jasmine.DEFAULT_TIMEOUT_INTERVAL = DEFAULT_TIMEOUT_INTERVAL;
  delete require.cache[require.resolve(__filename)];
});

export {describeWithoutTravisCI, describeWithWebdriver, Deferred, timeout, visit, withUnhandledRejection};