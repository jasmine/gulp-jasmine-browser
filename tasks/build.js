const del = require('del');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const {babel, header} = require('gulp-load-plugins')();
const runSequence = require('run-sequence');

const COPYRIGHT = '//(c) Copyright 2015 Pivotal Software, Inc. All Rights Reserved.\n';
const BABEL_SRC = ['src/lib/drivers/**/*.js', 'src/webpack/**/*.js', 'src/lib/headless.js', 'src/lib/server.js', 'src/lib/spec_runner.js', 'src/index.js'];
const BROWSER_SRC = ['src/lib/console_boot.js', 'src/lib/phantom_runner.js', 'src/lib/slimer_runner.js', 'src/lib/reporters/**/*.js'];
const CSS_SRC = ['src/lib/stylesheets/**/*.css'];
const NON_JS_SRC = ['LICENSE.md', 'README.md', 'package.json', 'public/jasmine_favicon.png'];

gulp.task('clean', done => del('dist', done));

gulp.task('babel', () => {
  return mergeStream(
    gulp.src(BABEL_SRC, {base: 'src'}).pipe(babel()).pipe(header(COPYRIGHT)),
    gulp.src(BROWSER_SRC, {base: 'src'}).pipe(header(COPYRIGHT)),
    gulp.src(CSS_SRC, {base: 'src'}),
    gulp.src(NON_JS_SRC, {base: '.'})
  ).pipe(gulp.dest('dist'));
});

gulp.task('build', done => runSequence('clean', 'babel', done));

gulp.task('watch', ['build'], () => {
  gulp.watch([...BABEL_SRC, ...BROWSER_SRC], ['babel']);
});