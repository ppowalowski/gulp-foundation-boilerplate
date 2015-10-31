'use strict';

var browserSync = require('browser-sync');
var rem2px = require('gulp-rem2px');
var reload = browserSync.reload;
var del = require('del');
var gulp = require('gulp'),
        cache = require('gulp-cache'),
        imagemin = require('gulp-imagemin'),
        notify = require('gulp-notify'),
        plumber = require('gulp-plumber'),
        sass = require('gulp-sass'),
        size = require('gulp-size'),
        uglify = require('gulp-uglify'),
        minifyCss = require('gulp-minify-css'),
        rename = require('gulp-rename'),
        util = require('gulp-util'),
        usemin = require('gulp-usemin'),
        env;


gulp.task('styles', function () {
    return gulp.src('app/scss/**/*.scss')
            .pipe(sass({
                errLogToConsole: true,
                includePaths: ['app/bower_components/foundation/scss']
            }))
            .pipe(gulp.dest('app/styles'))
            .pipe(reload({stream: true}))
            .pipe(notify("Compilation complete."));
    ;
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(reload({stream:true, once:true}))
        .pipe(size());
});

//gulp.task('css', ['styles'], function () {
//    gulp.src('app/styles/*.css')
//            .pipe(rem2px())
//            .pipe(gulp.dest('app/styles'));
//});


gulp.task('usemin', function () {
    return gulp.src('app/*.html')
        .pipe(usemin({
            css: [function () { return minifyCss({compatibility: 'ie8'});}],
            js: [uglify],
            html:[]
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function () {
  return del([
    'dist/css/**/*',
    'dist/js/**/*',
    'dist/*.html'
  ]);
});

gulp.task('init',['wiredep'], function () {
  return gulp
    .src(['bower_components/foundation/scss/foundation.scss','bower_components/foundation/scss/foundation/_settings.scss'],
    {cwd: 'app/' })
    .pipe(rename(function(path){
        path.dirname = ""; 
        if(path.basename == 'foundation')
            path.basename = '_foundation';
    }))
    .pipe(gulp.dest('app/scss'));
});

gulp.task('copy', function () {
  return gulp
    .src(['.*','*.*','fonts/**','**/*.html','!**/*.scss','!bower_components/**','!images/**', '!scss/**'],
    {cwd: 'app/' })
    .pipe(gulp.dest('dist'));
});

gulp.task('clean:full', function () {
  return del([
    'dist/*'
  ]);
});

gulp.task('serve', function () {
    browserSync.init(null, {
        server: {
            index: "index.html",
            baseDir: 'app'
        },
        debugInfo: false,
        host: "ppvm01",
        open: false
    }, function (err, bs) {
        require('opn')(bs.options.get('urls').get('local'));
        console.log('Started connect web server on ' + bs.options.get('urls').get('local'));
    });
});

gulp.task('watch', ['serve'], function () {

    // watch for changes
    gulp.watch(['app/*.html'], reload);
    gulp.watch('app/styles/**/*.scss', ['css']);
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;
    gulp.src('app/*.html')
            .pipe(wiredep({
                directory: 'app/bower_components'
            }))
            .pipe(gulp.dest('app'));
});

gulp.task('default', ['styles'], function () {
    gulp.start('watch');
});

gulp.task('build',['clean','copy','styles','usemin','images']);