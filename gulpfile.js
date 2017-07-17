let gulp = require('gulp');
let gutil = require('gulp-util');
let bower = require('bower');
let concat = require('gulp-concat');
let sass = require('gulp-sass');
let minifyCss = require('gulp-minify-css');
let rename = require('gulp-rename');
let sh = require('shelljs');
let babel = require('gulp-babel');
let plumber = require('gulp-plumber');
let browserify = require('browserify');
let path = require('path');
let source = require('vinyl-source-stream');
let glob = require('glob');

let paths = {
    sass: ['./src/scss/**/*.scss'],
    src: ['./src/**'],
    ngsrc: [
        './src/app.js',
        './src/app.routes.js',
        './src/services/*.js',
        './src/components/**/*.js',
        './src/components/**/**/*.js'
    ],
    ngdist: './src/browserify',
    ngMain: './src'
};

/*============================================================================
    Configuration
 ============================================================================*/
gulp.task("serve:before", ['default']);

gulp.task('default', ['browserify', 'babel', 'sass']);

/*============================================================================
    Watch Tasks
 ============================================================================*/
// gulp.task('watch', function () {
//     gulp.watch(paths.sass, ['sass']);
//     gulp.watch(paths.src, ['babel']);
// });

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.src, ['browserify']);
});

/*============================================================================
    SASS Related
 ============================================================================*/

gulp.task("devsass", function(done) {
    gulp.src('./src/scss/ionic.app.scss')
        .pipe(plumber())
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./src/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./src/css/'))
        .on('end', done);
});



gulp.task('sass', function (done) {
    gulp.src('./src/scss/ionic.app.scss')
        .pipe(plumber())
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

/*============================================================================
    Other
 ============================================================================*/
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

/*============================================================================
    Browserify
 ============================================================================*/
gulp.task('browserify', /*['lint', 'unit'],*/ function () {

    const dist = "src";
    const componentsDist = path.join(dist, "browserify");

    let rootFiles = glob.sync('./src/*.js');
    let services = glob.sync('./src/services/*.js');
    let components_lvl_1 = glob.sync('./src/components/*.js');
    let components_lvl_2 = glob.sync('./src/components/**/*.js');

    let allFiles = rootFiles.concat(services, components_lvl_1, components_lvl_2);


    return browserify(allFiles)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(plumber())
        .pipe(
            gulp.dest(componentsDist)
        );
});


/*============================================================================
    Babel
 ============================================================================*/

gulp.task('babel', function () {
    const dist = "www";
    const componentsDist = path.join(dist, "components");
    const jsDist = path.join(dist, "js");
    const bsfyDist = path.join(dist, "browserify");
    const partialsDist = path.join(dist, "partials");

/*============================================================================
    Handle the dist foler
 ============================================================================*/
    // sh.rm('-rf', dist);

/*============================================================================
    Components folders
 ============================================================================*/
    gulp.src('src/components/**/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(componentsDist));

    gulp.src('src/components/**/*.html')
        .pipe(plumber())
        .pipe(gulp.dest(componentsDist));

    gulp.src('src/components/**/*.css')
        .pipe(plumber())
        .pipe(gulp.dest(componentsDist));

/*============================================================================
    JS Folder
 ============================================================================*/
    gulp.src('src/js/**/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(jsDist));

    gulp.src('src/browserify/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(bsfyDist));


/*============================================================================
    Partials
 ============================================================================*/
    gulp.src('src/partials/**/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(partialsDist));

    // Handle the partials templates
    gulp.src('src/partials/**/*.html')
        .pipe(plumber())
        .pipe(gulp.dest(partialsDist));

/*============================================================================
    Services
 ============================================================================*/
    gulp.src('src/services/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(path.join(dist, "services")));

/*============================================================================
    Loose files
 ============================================================================*/

    gulp.src('src/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(dist));

    gulp.src('src/*.html')
        .pipe(plumber())
        .pipe(gulp.dest(dist));

/*============================================================================
    Vendor Files
 ============================================================================*/

    gulp.src('src/vendor/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(path.join(dist, "vendor")));

    gulp.src('src/vendor/*.css')
        .pipe(plumber())
        .pipe(gulp.dest(path.join(dist, "vendor")));

/*============================================================================
    Libs Folder
 ============================================================================*/

    gulp.src('src/lib/**/dist/*.js')
        // .pipe(babel({
        //     presets: ['es2015']
        // }))
        .pipe(plumber())
        .pipe(gulp.dest(path.join(dist, "lib")));

    gulp.src('src/lib/**/build/*.js')
        // .pipe(babel({
        //     presets: ['es2015']
        // }))
        .pipe(plumber())
        .pipe(gulp.dest(path.join(dist, "lib")));

    gulp.src('src/lib/**/*.min.js')
    // .pipe(babel({
    //     presets: ['es2015']
    // }))
        .pipe(plumber())
        .pipe(gulp.dest(path.join(dist, "lib")));

    gulp.src('src/lib/ionic/**/*.*')
    // .pipe(babel({
    //     presets: ['es2015']
    // }))
        .pipe(plumber())
        .pipe(gulp.dest(path.join(dist, "lib/ionic")));
});
