'use strict';
var gulp = require('gulp');
var less 			= require('gulp-less'),
	concat 			= require('gulp-concat'),
	autoprefixer 	= require('gulp-autoprefixer'),
	rename 			= require('gulp-rename'),
	csso 			= require('gulp-csso'),
	notify 			= require('gulp-notify'),
	path 			= require('path'),
	pug 			= require('gulp-pug'),
	babel 			= require('gulp-babel'),
	uglify 			= require('gulp-uglify');

var browserSync = require('browser-sync').create();

var paths = {
	styles: {src: ['./app/less/*.less', '!./app/less/_*.less'], dest: './templates/styles/'},
	template: {src: ['./app//**/*.pug', '!./app//**/_*.pug'], dest: './templates'},
	scripts: {src: ['./app/js//**/*.js', '!./app/js//**/_*.js'], dest: './templates/scripts/'}
};

// Таск для стилей
function styles() {
	return gulp.src(paths.styles.src)
		.pipe(less())
		.pipe(autoprefixer('last 10 versions'))
		.on("error", notify.onError({
			message: "Error: <%= error.message %>",
			title: "style"
		}))
		.pipe(concat('stylesheet.css'))
		.pipe(csso())
		.pipe(rename({ suffix: '.min' }))
	    .pipe(gulp.dest(paths.styles.dest))
};

// Таск для скриптов
function scripts() {
	return gulp.src(paths.scripts.src)
		.pipe(babel())
		.pipe(uglify())
		.on("error", notify.onError({
			message: "Error: <%= error.message %>",
			title: "Script"
		}))
		.pipe(concat('script.js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.scripts.dest));
}

// Таск для шаблонизатора
function template() {
	return gulp.src(paths.template.src)
	.pipe(pug({
		pretty: true
	}))
	.on("error", notify.onError({message: "Error: <%= error.message %>", title: "Template"}))
	.pipe( gulp.dest(function(file) {
		file.basename = file.basename.split( '.' )[0] + '.tpl';
		return './templates';
	}));
    // .pipe(gulp.dest(paths.template.dest))
};

// Следим за файлами
function watch(){
	gulp.watch('./app/**/*.pug', gulp.series(template))
	gulp.watch('./app/less/*.less', gulp.series(styles))
	gulp.watch('./app/**/*.js', gulp.series(scripts))
};

// Тасе для браузера и сервера
function serve() { 
	browserSync.init({
		//server: {baseDir: 'dist'},
		proxy: {target: "127.0.0.1:3535",},
        notify: false // Отключаем уведомления
    });
    browserSync.watch([
    	'app/**/*.*', 
    	'templates/**/*.*'
    ]).on('change', browserSync.reload); 
};

// Дефолтный таск 
gulp.task('default', gulp.series(
	gulp.parallel(template, styles, watch, scripts, serve)
));