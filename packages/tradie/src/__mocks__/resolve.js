let e = null;
let f = null;

export default function resolve(module, options, callback) {
  if (e) {
    callback(new Error(`Cannot find module '${module}'.`), null);
  } else {
    callback(null, f);
  }
}

resolve.throws = function() {
  e = true;
  f = null;
};

resolve.returns = function(file) {
  e = null;
  f = file;
};
