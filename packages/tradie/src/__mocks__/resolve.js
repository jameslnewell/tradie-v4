let e = null;
let f = null;

export default function resolve(module, options, callback) {
  if (e) {
    throw `Cannot find module '${module}'.`;
  }
  callback(e, f);
}

resolve.throws = function() {
  e = true;
  f = null;
};

resolve.returns = function(file) {
  e = null;
  f = file;
};
