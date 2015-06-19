var del = require('del');
var gulp = require('gulp');
var mergeStream = require('merge-stream');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

const COPYRIGHT = '//(c) Copyright 2015 Pivotal Software, Inc. All Rights Reserved.\n';

gulp.task('clean', function(callback) {
  del('dist', callback);
});

gulp.task('babel', function() {
  return mergeStream(
    gulp.src('src/**/*.js').pipe(plugins.babel()).pipe(plugins.header(COPYRIGHT)),
    gulp.src(['LICENSE.md', 'README.md', 'package.json', 'public/jasmine_favicon.png'], {base: './'})
  ).pipe(gulp.dest('dist'));
});

gulp.task('build', function(callback) {
  runSequence('clean', 'babel', callback);
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*.js', ['babel']);
});