import * as path from 'path';
import { getProjectInfo} from '../src';

(async () => {
  const {root, workspaces} = await getProjectInfo(path.join(__dirname, '../..'));
  console.log(root)
  console.log(workspaces);
})();
