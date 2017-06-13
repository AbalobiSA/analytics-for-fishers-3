let gulp = require('gulp');
let gutil = require('gulp-util');
let bower = require('bower');
let concat = require('gulp-concat');
let sass = require('gulp-sass');
let minifyCss = require('gulp-minify-css');
let rename = require('gulp-rename');
let sh = require('shelljs');
let babel = require('gulp-babel');

let paths = {
    sass: ['./src/scss/**/*.scss'],
    src: ['./src/**']
};

gulp.task('default', ['sass']);

gulp.task('sass', function (done) {
    gulp.src('./src/scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.src, ['babel']);
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});

gulp.task('babel', function () {
    let path = require('path');
    const dist = "www";
    const componentsDist = path.join(dist, "components");
    const jsDist = path.join(dist, "js");
    const partialsDist = path.join(dist, "partials");

/*============================================================================
    Handle the dist foler
 ============================================================================*/
    sh.rm('-rf', dist);

/*============================================================================
    Components folders
 ============================================================================*/
    gulp.src('src/components/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(componentsDist));

    gulp.src('src/components/**/*.html')
        .pipe(gulp.dest(componentsDist));

    gulp.src('src/components/**/*.css')
        .pipe(gulp.dest(componentsDist));

/*============================================================================
    JS Folder
 ============================================================================*/
    gulp.src('src/js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(jsDist));


/*============================================================================
    Partials
 ============================================================================*/
    gulp.src('src/partials/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(partialsDist));

    // Handle the partials templates
    gulp.src('src/partials/**/*.html')
    .pipe(gulp.dest(partialsDist));

/*============================================================================
    Services
 ============================================================================*/
    gulp.src('src/services/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(path.join(dist, "services")));

/*============================================================================
    Loose files
 ============================================================================*/

    gulp.src('src/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(dist));

    gulp.src('src/*.html')
    .pipe(gulp.dest(dist));

/*============================================================================
    Libs Folder
 ============================================================================*/

    gulp.src('src/lib/**/dist/*.js')
        // .pipe(babel({
        //     presets: ['es2015']
        // }))
        .pipe(gulp.dest(path.join(dist, "lib")));

    gulp.src('src/lib/**/build/*.js')
        // .pipe(babel({
        //     presets: ['es2015']
        // }))
        .pipe(gulp.dest(path.join(dist, "lib")));

    gulp.src('src/lib/**/*.min.js')
    // .pipe(babel({
    //     presets: ['es2015']
    // }))
        .pipe(gulp.dest(path.join(dist, "lib")));

    gulp.src('src/lib/ionic/**/*.*')
    // .pipe(babel({
    //     presets: ['es2015']
    // }))
        .pipe(gulp.dest(path.join(dist, "lib/ionic")));
});
