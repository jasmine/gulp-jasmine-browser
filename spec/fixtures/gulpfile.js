var gulp = require('gulp');
var webpack = require('gulp-webpack');
var jasmineBrowser = require('../../src/index');

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

gulp.task('webpack-server', function() {
  return gulp.src('mutable_spec.js')
    .pipe(webpack({watch: true, output: {filename: 'spec.js'}}))
    .pipe(jasmineBrowser.specRunner({console: false}))
    .pipe(jasmineBrowser.server());
});
