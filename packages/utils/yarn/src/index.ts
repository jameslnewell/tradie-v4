import * as path from 'path';
import findAndReadPackageJSON from 'find-and-read-package-json';
import {list} from '@tradie/file-utils';

export interface PackageInfo {
  path: string;
  name: string;
  meta: {[key: string]: any}
}

export interface ProjectInfo {
  root: PackageInfo;
  workspaces: PackageInfo[];
}

async function findAndReadProjectJSON(cwd: string = '.') {
  const {file: firstFile, json: firstJSON} = await findAndReadPackageJSON(path.resolve(cwd));
  if (firstJSON.workspaces) {
    return {file: firstFile, json: firstJSON};
  } else {
    try {
      const {file: secondFile, json: secondJSON} = await findAndReadPackageJSON(path.dirname(path.dirname(firstFile)));
      return {file: secondFile, json: secondJSON};
    } catch (error) {
      return {file: firstFile, json: firstJSON};
    }
  }
}

export async function getProjectInfo(cwd: string = '.'): Promise<ProjectInfo> {
  const {file, json} = await findAndReadProjectJSON(cwd);

  const root = {
    path: path.dirname(file),
    name: json.name,
    meta: json
  };

  if (!Array.isArray(json.workspaces)) {
    return {
      root,
      workspaces: []
    };
  }

  const workspaceFiles = await list(root.path, {
    include: json.workspaces.map((workspaceFile: string) => {
      return `${workspaceFile}${workspaceFile.endsWith('/') ? '' : '/'}package.json`;
    })
  });

  return {
    root,
    workspaces: workspaceFiles.map(workspaceFile => {
      const fullPath = path.join(root.path, workspaceFile);
      const workspaceJSON = require(fullPath);
      return {
        path: path.dirname(fullPath),
        name: workspaceJSON.name,
        meta: workspaceJSON
      };
    })
  };
}
