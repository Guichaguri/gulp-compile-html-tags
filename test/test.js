/**
 * This test uses a gulp task
 */

const gulp = require('gulp');

const header = require('gulp-header');
const cat = require('gulp-cat');
const uglify = require('gulp-uglify');

const compileHtml = require('./../index.js');

gulp.task('default', function() {
    return gulp.src('test.html')

        .pipe(compileHtml('script', function(tag, data) {
            return data
                .pipe(uglify()); // Minify the code inside the script tag
        }))

        .pipe(compileHtml(['script', 'style'], function(tag, data) {
            return data
                .pipe(header('/* Header added using gulp-compile-html-tags */')); // Add header in script and style tags
        }))

        .pipe(compileHtml('div', function(tag, data) {
            return data
                .pipe(header('<h1>Hello World!</h1>')); // Add header in div tags
        }))

        .pipe(cat()); // Use gulp-cat to log the final result in the console
});