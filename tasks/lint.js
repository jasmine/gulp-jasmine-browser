const gulp = require('gulp');
const {eslint, 'if': gulpIf} = require('gulp-load-plugins')();

gulp.task('lint', () => {
  const {FIX: fix = true} = process.env;
  return gulp.src(['gulpfile.js', 'tasks/**/*.js', 'src/**/*.js', 'spec/**/*.js'], {base: '.'})
    .pipe(eslint({fix}))
    .pipe(eslint.format('stylish'))
    .pipe(gulpIf(file => file.eslint && typeof file.eslint.output === 'string', gulp.dest('.')))
    .pipe(eslint.failOnError());
});
