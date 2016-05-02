var gulp = require('gulp'),
	header = require('gulp-header'),
	bump = require('gulp-bump'),
	git = require('gulp-git'),
	uglify = require('gulp-uglify'),
	ngAnnotate = require('gulp-ng-annotate'),
	rename = require("gulp-rename"),
    karma = require('karma').server;

gulp.task('test-unit', function(done) {
    karma.start({
        configFile: __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('dest', function() {
	gulp.src('./angular-confirm.js')
		.pipe(ngAnnotate())
		.pipe(uglify({preserveComments: 'all'}))
		.pipe(rename("angular-confirm.min.js"))
		.pipe(gulp.dest('./'))
});

gulp.task('bump-json', function (done) {
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump())
    .pipe(gulp.dest('./'));
});