import * as path from 'path';
import {getWorkspaces} from '../src';

(async () => {
  const workspaces = await getWorkspaces(path.join(__dirname, '../..'));
  console.log(workspaces);
})();
