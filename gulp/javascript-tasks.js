'use strict';

var closureCompiler = require('gulp-closure-compiler');
var concat = require('gulp-concat');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var jshint = require('gulp-jshint');
var htmlmin = require('gulp-htmlmin');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var PATHS = require('./paths.js');



/**
 * Minifies HTML
 */
gulp.task('minifyHTML', function() {
  return gulp.src('src/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeCommentsFromCDATA: true
    }))
    .pipe(gulp.dest('dist'))
});

/**
 * Lints JS
 * @param {function} callback Method to call after build is complete.
 **/
gulp.task('lint', function() {
 var jshintConfig = packageJSON.jshintConfig;

 gulp.src('./source/js/**/*.js')
   .pipe(jshint(jshintConfig))
   .pipe(notify(function(file) {
       if (file.jshint.success) {
         return false;
       }

       var errors = file.jshint.results.map(function (data) {
         if (data.error) {
           return '(' + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
         }
       }).join('\n');

       return file.relative + ' (' + file.jshint.results.length + ' errors)\n' + errors;
   }));
});


/**
 * Runs JS through the closure compiler.
 * Make sure COMPILATION_LEVEL is set to ADVANCED_OPTIMIZATIONS when building.
 * Update closure_entry_point for the name of your project
 **/
 gulp.task('minify_js_prod', function() {
   return gulp.src(PATHS.JS_SOURCES)
   .pipe(closureCompiler({
     compilerPath: './bower_components/closure-compiler/compiler.jar',
     continueWithWarnings: true,
     compilerFlags: {
       'compilation_level': 'ADVANCED_OPTIMIZATIONS',
       'closure_entry_point': 'Project',
       'externs': ['externs.js'],
       'generate_exports': true,
       'manage_closure_dependencies': true,
       'only_closure_dependencies': true,
       'output_wrapper': '(function(){%output%})();',
       'js': PATHS.JS_SOURCES
     },
     fileName: 'main.min.js'
   }))
   .pipe(gulp.dest(PATHS.JS_OUT_DIR))
   .pipe(notify({
     message : "Closure Compilation Complete",
     title : 'Gulp Notification',
     onLast : true
   }));
 });


 /**
  * Runs JS through the closure compiler.
  * Creates source maps for debugging.
  * Make sure COMPILATION_LEVEL is set to ADVANCED_OPTIMIZATIONS when building.
  * Update closure_entry_point for the name of your project
  **/
  gulp.task('minify_js_dev', function() {
    mkdirp('./dist/js', function (err) {
        if (err) {
            console.error(err)
        } else {
            return;
        }
    });
    return gulp.src(PATHS.JS_SOURCES)
    .pipe(sourcemaps.init())
    .pipe(closureCompiler({
      compilerPath: './bower_components/closure-compiler/compiler.jar',
      continueWithWarnings: true,
      compilerFlags: {
        'compilation_level': 'ADVANCED_OPTIMIZATIONS',
        'closure_entry_point': 'Project',
        'externs': ['externs.js'],
        'generate_exports': true,
        'manage_closure_dependencies': true,
        'only_closure_dependencies': true,
        'output_wrapper': '(function(){%output%})(); //@ sourceMappingURL=main.min.js.map',
        'create_source_map': PATHS.JS_OUT_DIR + 'main.min.js.map',
        'source_map_format': 'V3',
        'js': PATHS.JS_SOURCES
      },
      fileName: 'main.min.js'
    }))
    .pipe(sourcemaps.write(PATHS.JS_OUT_DIR))
    .pipe(gulp.dest(PATHS.JS_OUT_DIR));
    // .pipe(notify({
    //   message : "Closure Compilation Complete",
    //   title : 'Gulp Notification',
    //   onLast : true
    // }));
  });


/**
 * Deletes JS sourcemaps after prod minification occurs.
 * @param {function} cb Method to call after clean is complete.
 **/
 gulp.task('clean', ['minify_js_prod'], function(cb) {
    rimraf(PATHS.JS_OUT_DIR + 'source/js/', cb);
 });


gulp.task('watch_dev', function() {
  gulp.watch([PATHS.CSS_SOURCES], ['sass']);
  gulp.watch(PATHS.JS_SOURCES, ['minify_js_dev']);
});

gulp.task('watch_prod', function() {
  gulp.watch([PATHS.CSS_SOURCES], ['sass']);
  gulp.watch(PATHS.JS_SOURCES, ['minify_js_prod']);
});
