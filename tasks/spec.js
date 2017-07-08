import gulp from 'gulp';
import jasmine from 'gulp-jasmine'
import plumber from 'gulp-plumber';

gulp.task('spec', ['build'], () => {
  return gulp.src(['spec/**/*_spec.js', '!spec/fixtures/**/*.js'])
    .pipe(plumber())
    .pipe(jasmine({includeStackTrace: true}));
});
