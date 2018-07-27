import * as path from 'path';
import { loader } from 'webpack';
import {stringifyRequest} from 'loader-utils';
import {getProjectInfo, ProjectInfo, PackageInfo} from '../../../../../utils/yarn/lib';
import {list} from '../../../../../utils/file/lib';

interface ExampleMetadata {
  name: string;
  meta: {[key: string]: any};
  path: string;
}

interface PackageMetadata {
  name: string;
  meta: {[key: string]: any};
  examples: ExampleMetadata[];
}

interface ProjectMetadata {
  root: PackageMetadata;
  workspaces: PackageMetadata[];
}

async function getExampleMetadata(file: string): Promise<ExampleMetadata> {
  // TODO: execute the file to extract meta data e.g. name, description
  return {
    name: path.basename(file, '.example.tsx'),
    meta: {},
    path: file
  };
}

async function getPackageMetadata(packageInfo: PackageInfo): Promise<PackageMetadata> {
  const exampleFiles = await list(packageInfo.path, {
    include: 'src/**/*.example.tsx'
  });
  const exampleMetas = await Promise.all(exampleFiles.map(exampleFile => {
    return getExampleMetadata(path.join(packageInfo.path, exampleFile))
  }));
  return {
    name: packageInfo.name,
    meta: packageInfo.meta,
    examples: exampleMetas
  };
}

async function getProjectMetadata(projectInfo: ProjectInfo): Promise<ProjectMetadata> {
  return {
    root: await getPackageMetadata(projectInfo.root),
    workspaces: await Promise.all(projectInfo.workspaces.map(getPackageMetadata))
  };
}

function convertExampleMetadataToString(exampleMetadata: ExampleMetadata, context: loader.LoaderContext): string {
  return `{
    name: ${JSON.stringify(exampleMetadata.name)},
    meta: ${JSON.stringify(exampleMetadata.meta)},
    load: () => import(${stringifyRequest(context, exampleMetadata.path)})
  }`;
}

function convertPackageMetadataToString(packageMetadata: PackageMetadata, context: loader.LoaderContext): string {
  return `{
    name: ${JSON.stringify(packageMetadata.name)},
    meta: ${JSON.stringify(packageMetadata.meta)},
    examples: [${packageMetadata.examples.map(example => convertExampleMetadataToString(example, context))}]
  }`;
}

function convertProjectMetadataToString(projectMetadata: ProjectMetadata, context: loader.LoaderContext): string {
  return `module.exports = {
    root: ${convertPackageMetadataToString(projectMetadata.root, context)},
    workspaces: [
      ${projectMetadata.workspaces.map(packageMetadata => convertPackageMetadataToString(packageMetadata, context))}
    ]
  }`;
}

export default async function(this: loader.LoaderContext) {
  const callback = this.async();
  try {
    const context = this;
    const projectInfo = await getProjectInfo(); //FIXME: extract cwd from webpack context
    const projectMetadata = await getProjectMetadata(projectInfo);

    if (callback) {
      callback(null, convertProjectMetadataToString(projectMetadata, context));
    }
  } catch (error) {
    if (callback) {
      callback(error);
    }
  }

}
