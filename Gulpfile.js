/*eslint-env amd */
var gulp = require('gulp');
var es6ify = require('es6ify');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync');

var paths = {
  src: ["src/**/*.js"]
}

gulp.task('eslint', function() {
  return gulp.src(paths.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
})

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "."
    },
    port: 3004
  })
})

gulp.task('default', ['eslint'], function () {
  return browserify('./src/cors-upload.js')
    .transform(es6ify)
    .bundle()
    .pipe(source('cors-upload-bundle.js'))
    .pipe(gulp.dest('./dist/'));
});
