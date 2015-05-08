var gulp = require('gulp');
var npm = require('npm');

gulp.task('publish', ['build'], function(){
  npm.load({}, function(error) {
    if (error) return console.error(error);
    npm.commands.publish(['dist'], function(error) {
      if (error) return console.error(error);
    });
  });
});