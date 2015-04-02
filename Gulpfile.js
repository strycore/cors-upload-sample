/*eslint-env amd */
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var browserSync = require('browser-sync');

var paths = {
  src: ["src/**/*.js"],
  html: ["src/**/*.html"]
};

gulp.task('eslint', function() {
  return gulp.src(paths.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('html', function(){
  return gulp.src(paths.html)
    .pipe(gulp.dest('dist'));
});

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "."
    },
    port: 3004
  });
});

gulp.task('reload', function(){
  browserSync.reload();
});

gulp.task('watch', ['html', 'browser-sync'], function () {
  gulp.watch(paths.src, ['eslint', 'reload']);
});

gulp.task('default', ['watch']);
