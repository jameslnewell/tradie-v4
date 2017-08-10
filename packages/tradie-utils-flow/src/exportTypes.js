//@flow
import path from 'path';
import fs from 'fs-extra';
import isFlowConfigured from './isFlowConfigured';
import isFileAnnotated from './isFileAnnotated';

export default async function(
  file: string,
  directory: string,
  src: string,
  dest: string
) {
  //check if flow is configured before wasting time checking and getting errors
  if (!isFlowConfigured(directory)) {
    return;
  }

  const annotated = await isFileAnnotated(file);
  if (!annotated) {
    return;
  }

  const relFilePath = path.relative(src, file);
  const destFilePath = `${path.join(dest, relFilePath)}.flow`;
  await fs.copy(file, destFilePath);
}
