//@flow

export type File = {
  contents: string
};

export type FileMap = {
  [path: string]: File
};

export type FileStatus = 'A' | 'M' | 'D';

export type FileStatusMap = {
  [path: string]: FileStatus
};
