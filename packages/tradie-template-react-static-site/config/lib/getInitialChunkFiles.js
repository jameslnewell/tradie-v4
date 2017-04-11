
module.exports = (chunk, pattern) => {

  chunk.modules = undefined;
  chunk.entryModule = undefined;

  if (!chunk.isInitial()) {
    return [];
  }
  
  return chunk.files.filter(asset => pattern.test(asset));
};