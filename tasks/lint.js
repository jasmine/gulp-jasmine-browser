import gulp from 'gulp';
import eslint from 'gulp-eslint';
import gulpIf from 'gulp-if';

gulp.task('lint', () => {
  const {FIX: fix = true} = process.env;
  return gulp.src(['gulpfile.js', 'tasks/**/*.js', 'src/**/*.js', 'spec/**/*.js'], {base: '.'})
    .pipe(eslint({fix}))
    .pipe(eslint.format('stylish'))
    .pipe(gulpIf(file => file.eslint && typeof file.eslint.output === 'string', gulp.dest('.')))
    .pipe(eslint.failOnError());
});
