const gulp = require('gulp');
const webpack = require('webpack-stream');
const jasmineBrowser = require('../../dist/index');

gulp.task('phantomjs', function() {
  return gulp.src('dummy_spec.js')
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless({driver: 'phatomjs', showColors: false}));
});

gulp.task('slimerjs', function() {
  return gulp.src('dummy_spec.js')
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless({driver: 'slimerjs', showColors: false}));
});

gulp.task('chrome', () => {
  return gulp.src('dummy_spec.js')
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless({driver: 'chrome', showColors: false}));
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
