//gulp requires
var gulp 				= require('gulp'),
		sass 				= require('gulp-ruby-sass'),
		haml 				= require('gulp-ruby-haml'),
		minifycss 	= require('gulp-minify-css'),
		beep 				= require('beepbeep'),
		gutil 			= require('gulp-util'),
		plumber 		= require('gulp-plumber'),
		connect 		= require('gulp-connect'),
		uglify 			= require('gulp-uglify'),
		concat 			= require('gulp-concat'),
		rename 			= require("gulp-rename"),
		notify 			= require("gulp-notify"),
		livereload 	= require('gulp-livereload');

//error handling variables
var onError = function (err) {
    beep([0, 0, 0]);
    gutil.log(gutil.colors.green(err));
};

//source path variables
var hamlSources 	= ['components/views/**/*.haml'],
		sassSources 	= ['components/scss/application.scss'],
		jsSources 		= ['components/js/application.js'];

//web server for livereload
gulp.task('webserver', function() {
  connect.server({
	livereload: true,
	port: 3003
  });
});

//gulp sass tasks
gulp.task('sass', function () {
  var onError = function(err) {
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
        sound:    "Beep"
    })(err);

    this.emit('end');
	};

  return sass(sassSources)
		.pipe(gulp.dest('./css'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('../css'))
	  .pipe(plumber({errorHandler: onError}))
		.pipe(notify({
	       title: 'Gulp',
	       subtitle: 'success',
	       message: 'Completed SASS Task'
	   }))
	.pipe(connect.reload());
});

//gulp javascript tasks
gulp.task('js', function() {

	return gulp.src(jsSources)
	.pipe(concat('application.js'))
	.pipe(gulp.dest('./js'))
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('../js'))
	.pipe(notify({
       title: 'Gulp',
       subtitle: 'success',
       message: 'Completed JS Task'
   }))
	.pipe(connect.reload());
});

//gulp haml tasks
gulp.task('haml', function() {
	var onError = function(err) {
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>"
    })(err);

    this.emit('end');
	};

  gulp.src(hamlSources)
	.pipe(haml())
	.pipe(gulp.dest('./'))
  .pipe(plumber({errorHandler: onError}))
	.pipe(notify({
       title: 'Gulp',
       subtitle: 'success',
       message: 'Completed HAML Task'
   }))
	.pipe(connect.reload());
});

//gulp watch tasks
gulp.task('watch', function() {
	livereload.listen();
	gulp.watch('components/views/**/*.haml', ['haml']).on('change', stackReloadHAML);
	gulp.watch('components/scss/**/*.scss', ['sass']).on('change', stackReload);
	gulp.watch('components/js/**/*.js', ['js']).on('change', stackReload);

	// timeout variable
	var timer = null;

	// delay reload function for SASS/JS
	function stackReload() {
		var reload_args = arguments;

		// stop timeout function > livereload if this function is ran within the last 750ms
		if (timer) clearTimeout(timer);

		// Check if any gulp task is still running
		if (!gulp.isRunning) {
			timer = setTimeout(function() {
				console.log('testing');
				livereload.changed.apply(null, reload_args);
			}, 500);
		}
	}

	// delay reload function for HAML
	function stackReloadHAML() {
		var reload_args = arguments;

		// stop timeout function > livereload if this function is ran within the last 750ms
		if (timer) clearTimeout(timer);

		// Check if any gulp task is still running
		if (!gulp.isRunning) {
			timer = setTimeout(function() {
				console.log('testing');
				livereload.changed.apply(null, reload_args);
			}, 2000);
		}
	}
});

//runs all tasks through one command of 'gulp'
gulp.task('default', [ 'haml', 'sass', 'js', 'webserver', 'watch']);
