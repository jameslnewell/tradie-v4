import escape from 'shell-escape';
import exec from './exec';

export default async function(file: string) {
  const ast = await exec(['ast', escape(file)]);
  for (let i = 0; i < ast.comments.length; ++i) {
    const comment = ast.comments[i];
    if (/@flow/.test(comment.value)) {
      return true;
    }
  }
  return false;
}
