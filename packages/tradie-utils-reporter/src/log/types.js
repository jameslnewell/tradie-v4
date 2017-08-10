export type Level = 'info' | 'warn' | 'error';

export type Data = {
  file?: string,
  message: string,
  priority: number
};

export type Record = {
  level: Level
} & Data;
