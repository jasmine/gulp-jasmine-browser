const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

gulp.task('spec', ['build'], () => {
  return gulp.src(['spec/**/*_spec.js', '!spec/fixtures/**/*.js'])
    .pipe(plugins.plumber())
    .pipe(plugins.jasmine({includeStackTrace: true}));
});
