
export interface File {
  contents: string;
};

export interface FileMap {
  [path: string]: File;
};

export type FileStatus = 'A' | 'M' | 'D';

export interface FileStatusMap {
  [path: string]: FileStatus;
};
