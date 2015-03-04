var path = require('path');
var childProcess = require('child_process');

function gulp(task, callback) {
  return childProcess.exec([
    'node_modules/.bin/gulp',
    '--gulpfile', path.resolve(__dirname, 'fixtures', 'gulpfile.js'),
    task
  ].join(' '), callback);
}

describe('gulp-jasmine-browser', function() {
  it('works', function(done) {
    gulp('dummy', function(error, stdout, stderr) {
      expect(error).toBe(null);
      expect(stderr).toBe('');
      expect(stdout).toContain('2 specs, 1 failure');
      done();
    });
  });
});
