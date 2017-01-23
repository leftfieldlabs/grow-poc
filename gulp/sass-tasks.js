'use strict';

var autoprefixer = require('gulp-autoprefixer');
var csscomb = require('gulp-csscomb');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var PATHS = require('./paths.js');


/**
 * Compiles SASS files into minified css.
 */
gulp.task('sass', function() {
  return gulp.src('./source/sass/*.scss')
    .pipe(plumber())
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest(PATHS.CSS_OUT_DIR))
    .pipe(notify({
        message : "SASS Compilation Complete",
        title : 'Gulp Notification',
        onLast : true
    }));
});


/**
 * Combs CSS and alphabetizes declarations
 */
gulp.task('css-comb', function() {
  return gulp.src(PATHS.CSS_SOURCES)
    .pipe(csscomb())
    .pipe(gulp.dest('./source/sass/'));
});
