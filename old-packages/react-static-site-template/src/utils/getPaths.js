import path from 'path';

export default root => {
  const src = path.resolve(root, './src');
  const dest = path.resolve(root, './dist');
  const tmp = path.resolve(root, './tmp');

  return {
    src,
    dest,
    tmp,

    vendorEntryFile: path.join(src, 'vendor.js'),
    vendorManifestFile: path.join(tmp, 'vendor.json')
  };
};
