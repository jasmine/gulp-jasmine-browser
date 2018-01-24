import gulp from 'gulp';
import npm from 'npm';

gulp.task('publish', gulp.series('build', () => {
  npm.load({}, function(error) {
    if (error) return console.error(error);
    npm.commands.publish(['dist'], function(error) {
      if (error) return console.error(error);
    });
  });
}));