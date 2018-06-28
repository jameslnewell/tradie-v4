import * as path from 'path';
import findAndReadPackageJSON from 'find-and-read-package-json';
import {list} from '@tradie/file-utils';

export async function getWorkspaces(cwd: string) {
  const {file, json} = await findAndReadPackageJSON(cwd);

  const root = path.dirname(file);
  const patterns = json.workspaces;

  if (!Array.isArray(patterns)) {
    return {
      root,
      workspaces: [path.dirname(file)]
    };
  }

  const manifests = await list(root, {
    include: patterns.map(workspace => {
      return `${workspace}${workspace.endsWith('/') ? '' : '/'}package.json`;
    })
  });

  return {
    root,
    workspaces: manifests.map(manifest => path.dirname(path.join(root, manifest)))
  };
}
