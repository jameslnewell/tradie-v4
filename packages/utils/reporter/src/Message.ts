import {MessageType} from './MessageType';

export interface Message {
  type: MessageType;
  file?: string;
  startPosition?: {
    line: number;
    column: number;
  };
  endPosition?: {
    line: number;
    column: number;
  };
  source?: string; // the app, package, plugin or module
  text: string;
  meta?: { [name: string]: any };
  trace?: string;
};
