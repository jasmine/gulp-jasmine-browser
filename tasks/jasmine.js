var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('spec', function() {
  return gulp.src(['spec/**/*_spec.js', '!spec/fixtures/**/*.js'])
    .pipe(plugins.plumber())
    .pipe(plugins.jasmine());
});
