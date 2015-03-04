var path = require('path');
var childProcess = require('child_process');

function gulp(task) {
  return childProcess.execSync([
    'node_modules/.bin/gulp',
    '--gulpfile', path.resolve(__dirname, 'fixtures', 'gulpfile.js'),
    task
  ].join(' '), {encoding: 'utf8'});
}

describe('gulp-jasmine-browser', function() {
  it('works', function() {
    expect(gulp('dummy')).toContain('2 specs, 1 failure');
  });
});
