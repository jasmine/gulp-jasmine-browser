var del = require('del');
var gulp = require('gulp');
var mergeStream = require('merge-stream');
var plugins = require('gulp-load-plugins')();

const COPYRIGHT = '//(c) Copyright 2015 Pivotal Software, Inc. All Rights Reserved.\n';

gulp.task('clean', function(callback) {
  del('dist', callback);
});

gulp.task('build', ['clean'], function() {
  return mergeStream(
    gulp.src('src/**/*.js').pipe(plugins.babel()).pipe(plugins.header(COPYRIGHT)),
    gulp.src(['LICENSE', 'README.md', 'package.json'])
  ).pipe(gulp.dest('dist'));
});