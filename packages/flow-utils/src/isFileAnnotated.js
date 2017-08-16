import exec from './exec';

export default function(file: string) {
  return exec(['ast', file]).then(ast => {
    for (let i = 0; i < ast.comments.length; ++i) {
      const comment = ast.comments[i];
      if (/@flow/.test(comment.value)) {
        return true;
      }
    }
    return false;
  });
}
