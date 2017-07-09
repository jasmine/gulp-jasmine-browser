function compact(array) {
  return array.filter(Boolean);
}

function parse(obj) {
  try {
    return JSON.parse(obj);
  } catch(e) {
  }
}

export {compact, parse};