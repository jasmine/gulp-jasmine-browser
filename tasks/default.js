const gulp = require('gulp');
const runSequence = require('run-sequence');

gulp.task('default', done => runSequence('lint', 'spec', done));
