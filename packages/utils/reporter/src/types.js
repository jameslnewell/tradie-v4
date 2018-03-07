export type MessageType = 'info' | 'warn' | 'error';

export type Message = {
  type: MessageType,
  file?: string,
  startPosition: {
    line?: number,
    column?: number
  },
  endPosition: {
    line?: number,
    column?: number
  },
  source?: string,
  text: string,
  meta?: {[name: string]: *},
  trace?: string
};
