const del = require('del');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const {babel} = require('gulp-load-plugins')();
const runSequence = require('run-sequence');

const TRANSPILE_SRC = ['src/lib/drivers/**/*.js', 'src/webpack/**/*.js', 'src/lib/headless.js', 'src/lib/server.js', 'src/lib/spec_runner.js', 'src/index.js', 'src/lib/chrome_runner'];
const RAW_SRC = ['src/lib/boot.js', 'src/lib/phantom_runner.js', 'src/lib/slimer_runner.js', 'src/lib/chrome_runner.js', 'src/lib/reporters/**/*.js'];
const CSS_SRC = ['src/lib/stylesheets/**/*.css'];
const NON_JS_SRC = ['LICENSE.md', 'README.md', 'package.json', 'public/jasmine_favicon.png'];

gulp.task('clean', done => del('dist', done));

gulp.task('babel', () => {
  return mergeStream(
    gulp.src(TRANSPILE_SRC, {base: 'src'}).pipe(babel()),
    gulp.src(RAW_SRC, {base: 'src'}),
    gulp.src(CSS_SRC, {base: 'src'}),
    gulp.src(NON_JS_SRC, {base: '.'})
  ).pipe(gulp.dest('dist'));
});

gulp.task('build', done => runSequence('clean', 'babel', done));

gulp.task('watch', ['build'], () => {
  gulp.watch([...TRANSPILE_SRC, ...RAW_SRC], ['babel']);
});