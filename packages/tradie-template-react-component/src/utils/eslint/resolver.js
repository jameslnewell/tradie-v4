export const interfaceVersion = 2;

export function resolve(source, file, config) {
  if (config.indexOf(source) !== -1) {
    return {
      found: true,
      path: null
    };
  } else {
    return {found: false};
  }
}
