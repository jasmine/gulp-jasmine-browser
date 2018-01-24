import gulp from 'gulp';

gulp.task('default', gulp.series('lint', 'spec'));
