var gulp = require('gulp');
var jasmineBrowser = require('../../index');

gulp.task('dummy', function() {
  return gulp.src('dummy_spec.js')
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.phantomjs());
});