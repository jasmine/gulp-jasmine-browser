import gulp from 'gulp';
import npm from 'npm';

gulp.task('publish', gulp.series('build', done => {
  npm.load({}, error => {
    if (error) {
      console.error(error);
      done();
    }
    npm.commands.publish(['dist'], error => {
      if (!error) done();
      console.error(error);
      done();
    });
  });
}));