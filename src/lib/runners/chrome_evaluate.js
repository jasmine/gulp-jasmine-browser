module.exports = streamPort => {
  let resolve;
  const promise = new Promise(res => resolve = res);
  const send = body => fetch(`http://localhost:${streamPort}`, {method: 'POST', body});
  window.callPhantom = result => {
    if (result.message) send(result.message);
    if (result.exit) resolve();
  };
  jasmine.getEnv().execute();
  return promise;
};