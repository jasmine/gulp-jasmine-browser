const gulp = require('gulp');
const npm = require('npm');

gulp.task('publish', ['build'], () => {
  npm.load({}, function(error) {
    if (error) return console.error(error);
    npm.commands.publish(['dist'], function(error) {
      if (error) return console.error(error);
    });
  });
});