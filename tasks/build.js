import babel from 'gulp-babel';
import del from 'del';
import gulp from 'gulp';
import mergeStream from 'merge-stream';

const TRANSPILE_SRC = ['src/lib/drivers/**/*.js', 'src/webpack/**/*.js', 'src/lib/headless.js', 'src/lib/server.js', 'src/lib/spec_runner.js', 'src/lib/helper.js', 'src/lib/runners/chrome_runner', 'src/index.js'];
const RAW_SRC = ['src/lib/boot.js', 'src/lib/runners/phantom_runner.js', 'src/lib/runners/slimer_runner.js', 'src/lib/runners/chrome_evaluate.js', 'src/lib/reporters/**/*.js'];
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

gulp.task('build', gulp.series('clean', 'babel'));

gulp.task('build-watch', () => {
  return gulp.watch([...TRANSPILE_SRC, ...RAW_SRC], ['babel']);
});

gulp.task('watch', gulp.series('build', 'build-watch'));
