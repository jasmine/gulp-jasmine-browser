var gulp = require('gulp');
var jasmineBrowser = require('../../index');

gulp.task('phantomjs', function() {
  return gulp.src('dummy_spec.js')
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.phantomjs());
});

gulp.task('server', function() {
  return gulp.src('dummy_spec.js')
    .pipe(jasmineBrowser.specRunner({console: false}))
    .pipe(jasmineBrowser.server());
});
