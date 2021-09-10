var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var dbinit = require('./src/assets/db/dbinit');

gulp.task('initDB',function(){
	return gulp.src(['src/**/db/*.json', '!src/**/db/main.json'])
		.pipe(concat('main.json'))
		.pipe(dbinit())
		.pipe(gulp.dest('src/assets/db/'))
});
