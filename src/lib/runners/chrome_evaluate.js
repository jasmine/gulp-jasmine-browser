module.exports = streamPort => {
  let resolve;
  const promise = new Promise(res => resolve = res);
  const socket = new WebSocket(`ws://localhost:${streamPort}`);
  window.callPhantom = result => {
    if (result.message) socket.send(result.message);
    if (result.exit) (socket.close(), resolve())
  };
  socket.onopen = () => jasmine.getEnv().execute();
  return promise;
};