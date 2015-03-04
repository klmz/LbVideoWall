'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var livereload = require('gulp-livereload');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var concat = require("gulp-concat");
var plumber = require("gulp-plumber");
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
// var reactify = require("reactify");

var getBundleName = function () {
  var version = require('./package.json').version;
  var name = require('./package.json').name;
  return version + '.' + name + '.' + 'min';
};

// start server
gulp.task('browser-sync', function() {
    browserSync({
        proxy: "localhost:4000"
    });
});

var makeBundle = function(bundler){
	return function() {
		// bundler.transform(reactify);
		return bundler
		  .bundle()
		  .pipe(plumber())
		  .pipe(source(getBundleName() + '.js'))
		  .pipe(buffer())
		  .pipe(sourcemaps.init({loadMaps: true}))
		    // Add transformation tasks to the pipeline here.
		  // .pipe(babel())
		  // .pipe(uglify())
		  .pipe(sourcemaps.write('./'))
		  .pipe(gulp.dest('./dist/js/'))
		  ;
	};
}
// process JS files and return the stream.
gulp.task('js', function () {
	browserSync.notify("Compiling, please wait!");

		var bundler = browserify({
		    entries: ['./entry.js'],
	    	debug: false
		});

	var bundle = makeBundle(bundler);
	return bundle();
});


// use default task to launch BrowserSync and watch JS files
gulp.task('default', ['browser-sync'], function () {
    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
	gulp.watch(["*.js" , "*/*.js", "*/*/*.js", "js/util/*.js","js/models/*.js"], ['js', browserSync.reload]);
});