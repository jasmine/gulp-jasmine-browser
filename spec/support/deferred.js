export default function Deferred() {
  let resolver, rejector;
  const promise = new Promise(function(res, rej) {
    resolver = res;
    rejector = rej;
  });

  const wrapper = Object.assign(promise, {
    resolve(...args) {
      resolver(...args);
      return wrapper;
    },
    reject(...args) {
      rejector(...args);
      return wrapper;
    },
    promise() {
      return promise;
    }
  });
  return wrapper;
}