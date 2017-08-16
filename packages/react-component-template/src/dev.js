import getDevConfig from './utils/webpack/getDevConfig';

export default function({root}) {
  return {
    root,
    webpack: getDevConfig({root})
  };
}
