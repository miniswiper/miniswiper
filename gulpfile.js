/**
 * Miniswiper Gulpfile
 *
 * @author Miniswiper contributors 
 * @copyright (c) 2018-present Miniswiper contributors All Rights Reserved.
 */
var gulp = require('gulp');

// import modules
var less = require('gulp-less'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	clean = require('gulp-clean');

// compile less to css
gulp.task('buildcss', function(){
	gulp.src('miniswiper.less')
	.pipe( less() )
	.pipe( gulp.dest('dist') );
});

// minify css
gulp.task('minifycss', function() {
	gulp.src( 'dist/miniswiper.css'  )
	.pipe( rename({suffix: '.min'}) )
	.pipe( minifycss() )
	.pipe( gulp.dest('dist') );
});

// minify javascript
gulp.task('minifyjs', function() {
	gulp.src( 'dist/miniswiper.js' )
	.pipe( rename({suffix: '.min'}) )
	.pipe( uglify({output:{comments: /^\*/}}) )
	.pipe( gulp.dest('dist') );
});

// clean "dist" directory
gulp.task('clean', function() {
	gulp.src('dist/*.@(css|js)')
	.pipe( clean() );
});

// task: develop
gulp.task('develop', ['buildcss'], function(){
	gulp.src('miniswiper.js')
	.pipe( gulp.dest('dist') );
});

// task: deploy
gulp.task('deploy', ['develop', 'minifycss', 'minifyjs']);

// task: default
gulp.task('default', ['develop']);

// task: watch
gulp.task('watch', function(){
	gulp.watch(['*.@(less|js)'], ['develop']);
});
