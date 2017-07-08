import * as selenium from './selenium';
import thenify from 'thenify';
import * as webdriverio from 'webdriverio';
import waitOnCallback from 'wait-on';

const waitOn = thenify(waitOnCallback);
const privates = new WeakMap();

export default class JasmineWebdriver {
  constructor({browser = 'firefox', timeout = 500} = {}) {
    privates.set(this, {processes: [], desiredCapabilities: {browserName: browser}, timeout});
  }

  driver() {
    const {desiredCapabilities, processes, timeout} = privates.get(this);
    return new Promise(async (resolve, reject) => {
      const port = 4444;
      await selenium.install();
      const process = await selenium.start({spawnOptions: {stdio: ['ignore', 'ignore', 'ignore']}});
      processes.push({process, closed: new Promise(res => process.once('close', res))});
      await waitOn({resources: [`tcp:${port}`], timeout: 30000}).catch(() => reject(`error in waiting for selenium server on port ${port}`));
      const driver = webdriverio.remote({desiredCapabilities, waitforTimeout: timeout}).init();
      await driver;
      processes.push({driver});
      resolve({driver});
    });
  }

  async end() {
    const {processes} = privates.get(this);
    const webdriverProcesses = processes.filter(p => p.driver).map(p => p.driver.end());
    await Promise.all(webdriverProcesses);
    const otherProcesses = processes.filter(p => p.process).map(p => (p.process.kill(), p.closed));
    await Promise.all(otherProcesses);
    return Promise.all([webdriverProcesses, ...otherProcesses]);
  }
}