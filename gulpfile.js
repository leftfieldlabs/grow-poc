var gulp            = require('gulp');

require('require-dir')('./gulp');

gulp.task('build', ['minify_js_prod', 'sass', 'clean'], function() {
  gulp.on('stop', () => { process.exit(0); });
  gulp.on('err', () => { process.exit(1); });
});
gulp.task('dev', ['minify_js_dev', 'sass', 'watch_dev']);
gulp.task('prod', ['minify_js_prod', 'sass', 'watch_prod']);
gulp.task('png', ['minify-png']);
gulp.task('miniHTML', ['minifyHTML']);
gulp.task('check', ['lint']);
gulp.task('default', ['prod']);
