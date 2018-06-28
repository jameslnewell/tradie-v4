/* tslint:disable no-shadowed-variable */
import { Message } from "../Message";
import { start } from "repl";

export function groupMessagesByFileAndSortMessagesByStartPosition(messages: Message[]): Message[] {
  const messagesByFile: {[file: string]: Message[]} = messages.reduce((messagesByFile: {[file: string]: Message[]}, message: Message) => {
    const {file = ''} = message;
    if (!messagesByFile[file]) {
      messagesByFile[file] = [];
    }
    messagesByFile[file].push(message);
    return messagesByFile;
  }, {});
  return Object.keys(messagesByFile).filter(file => file !== '').map(file => messagesByFile[file]).reduce((messagesSortedByFileAndPosition: Message[], messagesForFile: Message[]) => {
    return messagesSortedByFileAndPosition.concat(messagesForFile.sort(((a: Message, b: Message) => {
      const startPositionA = a.startPosition;
      const startPositionB = b.startPosition;
      if (startPositionA && startPositionB) {
        if (startPositionA.line < startPositionB.line) {
          return -1;
        } else if (startPositionA.line > startPositionB.line) {
          return 1;
        }
        if (startPositionA.column < startPositionB.column) {
          return -1;
        } else if (startPositionA.column > startPositionB.column) {
          return 1;
        }
      } else if (startPositionA) {
        return 1;
      } else if (startPositionB) {
        return -1
      }
      return 0;
    })));
  }, messagesByFile[''] || []);
}
