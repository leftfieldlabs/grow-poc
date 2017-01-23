'use strict';

var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var mkdirp = require('mkdirp');
var notify = require('gulp-notify');
var pngquant = require('imagemin-pngquant');

/**
 * Minifies images based on quality/speed recommendations
 */
gulp.task('minify-png', function () {
  mkdirp('./dist/images', function (err) {
      if (err) {
          console.error(err)
      } else {
          return;
      }
  });
  return gulp.src('./source/images/**/*')
      .pipe(imagemin({
          progressive: true,
          verbose: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant({
            quality: '45-75',
            speed: 8
          })],
      }))
      // !IMPORTANT manually move from /tmp to /static to avoid recompressing images
      .pipe(gulp.dest('dist/images'))
      .pipe(notify({
        message : "PNG minification Complete",
        title : 'Gulp Notification',
        onLast : true
      }));
});
