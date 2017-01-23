/**
 * Declares paths for gulp tasks.
 */
var PATHS = {
  HTML_SOURCES: './views/*.html',
  CSS_SOURCE_DIR: './source/sass/',
  CSS_SOURCES: './source/sass/*',
  CSS_OUT_DIR: './dist/css/',
  JS_OUT_DIR: './dist/js/',
  JS_SOURCES: [
    './bower_components/closure-library/**.js',
    './source/js/**.js',
    './source/third-party/ga-utils/src/base.js',
    './source/third-party/ga-utils/src/deps.js',
    './source/third-party/ga-utils/src/utils/tracker.js',
    './source/third-party/ga-utils/src/utils/scroll-section-monitor.js',
    './source/third-party/ga-utils/src/components/tracking-section.js',
    './source/third-party/ga-utils/src/components/scroll-aware-section.js',
    '!**_test.js'
  ]
};

module.exports = PATHS;
