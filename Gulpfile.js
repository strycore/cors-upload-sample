/*eslint-env amd */
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var browserSync = require('browser-sync');

var paths = {
  src: ["src/**/*.js"],
  html: ["src/**/*.html", "index.html"]
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

gulp.task('js-watch', ['eslint'], browserSync.reload);
gulp.task('html-watch', ['html'], browserSync.reload);

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "."
    },
    port: 3004
  });
  gulp.watch(paths.src, ['js-watch']);
  gulp.watch(paths.html, ['html-watch']);
});

gulp.task('default', ['browser-sync']);
