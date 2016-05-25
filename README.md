# gulp-compile-html-tags
Gulp plugin for compiling content inside html tags

This plugin let you run gulp plugins with the content of html tags.

For example, you can compile SASS/Babel code, minify css and javascript, change the content of any html tag, etc

## Installation
```
$ npm install gulp-compile-html-tags --save-dev
```

## Examples

In this example, it will minify the javascript code inside `script` tags
```javascript
var gulp = require('gulp');
var compileHtmlTags = require('gulp-compile-html-tags');
var uglify = require('gulp-uglify');

gulp.task('default', function() {
    return gulp.src('**/*.html')
        .pipe(compileHtmlTags('script', function(tag, data) {
            return data
                .pipe(uglify());
        }))
        .pipe(gulp.dest('./out/'));
});
```

In the example below, it will compile SASS and minify the code inside `style` tags
```javascript
var gulp = require('gulp');
var compileHtmlTags = require('gulp-compile-html-tags');
var sass = require('gulp-sass');
var csso = require('gulp-csso');

gulp.task('default', function() {
    return gulp.src('**/*.html')
        .pipe(compileHtmlTags('style', function(tag, data) {
            return data
                .pipe(sass())
                .pipe(csso());
        }))
        .pipe(gulp.dest('./out/'));
});
```

This last example will add a header in `style` and `script` tags
```javascript
var gulp = require('gulp');
var compileHtmlTags = require('gulp-compile-html-tags');
var header = require('gulp-header');
var csso = require('gulp-csso');

gulp.task('default', function() {
    return gulp.src('**/*.html')
        .pipe(compileHtmlTags(['style', 'script'], function(tag, data) {
            return data
                .pipe(header('/* The code below is licensed under LGPL-2.0 */'));
        }))
        .pipe(gulp.dest('./out/'));
});
```