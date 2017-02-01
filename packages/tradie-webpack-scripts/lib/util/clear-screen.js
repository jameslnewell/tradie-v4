
module.exports = () => {

  //don't output on CI
  if (process.env.CI) {
    return;
  }

  //don't output if we're not outputting to a terminal
  if (!process.stdout.isTTY) {
    return;
  }

  //clear the screen
  console.log('\x1B[2J');

  //move the cursor to 1:1
  console.log('\x1B[1;1H');

};
