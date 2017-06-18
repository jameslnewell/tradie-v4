let e = null;
let f = null;

export default function resolve(module, options, callback) {
  callback(e, f);
}

resolve.mock = function(error = null, file = null) {
  e = error;
  f = file;
};
