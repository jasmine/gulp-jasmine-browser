import path from 'path';
export default function chrome() {
  return {
    get command() {
      return path.resolve(__dirname, '../chrome_runner');
    },
    output: 'stderr'
  };
}