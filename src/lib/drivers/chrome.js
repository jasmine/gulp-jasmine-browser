import path from 'path';
export default function chrome() {
  return {
    get command() {
      return process.platform === 'win32'
          ? 'node'
          : path.resolve(__dirname, '../runners/chrome_runner');
    },
    get runner() {
      return process.platform === 'win32'
          ? 'chrome_runner'
          : undefined;
    },
    output: 'stderr'
  };
}