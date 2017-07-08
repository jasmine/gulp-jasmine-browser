const privates = new WeakMap();

export default class JasminePlugin {
  constructor() {
    let resolve = function() {};
    let reject = function() {};
    const promise = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });

    privates.set(this, {promise, resolve, reject});

    this.whenReady = () => privates.get(this).promise;
  }
  apply(compiler) {
    compiler.plugin('invalid', () => {
      let {resolve, reject, promise} = privates.get(this);
      reject();
      promise = new Promise(function(res, rej) {
        resolve = res;
        reject = rej;
      });
      privates.set(this, {promise, resolve, reject});
      return promise;
    });
    compiler.plugin('done', () => privates.get(this).resolve());
  }
}