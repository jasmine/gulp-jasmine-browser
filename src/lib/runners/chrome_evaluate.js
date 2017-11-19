module.exports = function () {
  var socket = new WebSocket('ws://localhost:9876');
  return new Promise(function (resolve) {
    socket.onopen = function () {
      window.callPhantom = function (result) {
        if (result.message) socket.send(result.message);
        if (result.exit) {
          socket.close();
          return resolve();
        }
      };
      jasmine.getEnv().execute();
    }
  });
};