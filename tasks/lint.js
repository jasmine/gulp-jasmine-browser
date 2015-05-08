var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('lint', function() {
  return gulp.src(['gulpfile.js', 'tasks/**/*.js', 'src/**/*.js', 'spec/**/*.js', '!src/lib/console.js'])
    .pipe(plugins.plumber())
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format('stylish'))
    .pipe(plugins.eslint.failOnError());
});