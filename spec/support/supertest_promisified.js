const methods = require('methods');
const supertest = require('supertest');

function then(onFulfilled, onRejected) {
  return new Promise(function(resolve, reject) {
    this.end(function(error, response) {
      if (response) return resolve(response);
      reject(error);
    });
  }.bind(this)).then(onFulfilled, onRejected);
}

module.exports = function(...args) {
  const request = supertest(...args);
  return methods.reduce(function(wrapped, method) {
    return Object.assign(wrapped, {
      [method]() {
        return Object.assign(request[method].apply(request, arguments), {then});
      }
    });
  }, {});
};