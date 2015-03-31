/*eslint-env amd */
var gulp = require('gulp');
var es6ify = require('es6ify');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var paths = {
  src: ["src/**/*.js"]
}

gulp.task('eslint', function() {
  return gulp.src(paths.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
})

gulp.task('default', ['eslint'], function () {
  return browserify('./src/cors-upload.js')
    .transform(es6ify)
    .bundle()
    .pipe(source('cors-upload-bundle.js'))
    .pipe(gulp.dest('./dist/'));
});
