
//////////////////////
// Convention names //
//////////////////////
var development = 'DEV',        // Development's tag name
    distribution = 'DIST';      // Distribution's tag name
    distFolderName = 'dist';    // Dist Folder Name
///////////////////////////
// Environment variables //
///////////////////////////
var ENV = development;

function isDevelopment() { return ENV === development; }
function isDistribution() { return ENV === distribution; }

var gulp = require('gulp');
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*','del', 'browser-sync']
});


//////////////////////
// OnError function //
//////////////////////

var onError = function(err) {
        console.log(err);
        $.util.beep(); };

////////////////////////////////////////////////////////
// sourcemap, concats, uglifies, sufix .min and write //
////////////////////////////////////////////////////////

function processJS(path, name){
    gulp.src(path)
        .pipe($.plumber({ errorHandler: onError }))
        .pipe($.if(isDevelopment(), $.sourcemaps.init()))
        .pipe($.concat(name + '.js', { }))
        .pipe($.uglify())
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.if(isDevelopment(), $.sourcemaps.write()))
        .pipe(gulp.dest(distFolderName+'/js'))
        .pipe($.browserSync.reload({ stream: true }));
};



////////////////////////////////////////////////////////
// sourcemap, concats, uglifies, sufix .min and write //
////////////////////////////////////////////////////////
function processCSS(path, name){
    gulp.src(path)
        .pipe($.plumber({ errorHandler: onError }))
        .pipe($.if(isDevelopment(), $.sourcemaps.init()))
        .pipe($.concat(name + '.css', { }))
        .pipe($.less())
        .pipe($.minifyCss({compatibility: 'ie8'}))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.if(isDevelopment(), $.sourcemaps.write()))
        .pipe(gulp.dest(distFolderName+'/css'))
        .pipe($.browserSync.reload({ stream: true }));
};


///////////////////////////
// Process all JS files  //
///////////////////////////
gulp.task('js', function(){
    processJS('src/scripts/theme/*.js', 'theme');
    processJS('src/scripts/vendors/*.js', 'vendors');
});


/////////////////////////////
// Process all LESS files  //
/////////////////////////////
gulp.task('less', function(){
    processCSS('src/less/vendors.less', 'vendors');
    processCSS('src/less/theme.less', 'theme');
});

///////////////////////////////
// Process all FONTS files   //
///////////////////////////////
gulp.task('fonts', function(){
    gulp.src('src/assets/fonts/**')
        .pipe($.plumber({ errorHandler: onError }))
        .pipe(gulp.dest(distFolderName+'/fonts'))
        .pipe($.browserSync.reload({ stream: true }));
});


////////////////////////////////
// Process all IMAGES files   //
////////////////////////////////
gulp.task('images', function(){
    gulp.src('src/assets/images/**')
        .pipe($.plumber({ errorHandler: onError }))
        .pipe(gulp.dest(distFolderName+'/images'))
        .pipe($.browserSync.reload({ stream: true }));
});


///////////////////////////////
// Process all ICONS files   //
///////////////////////////////
gulp.task('icons', function(){
    gulp.src('src/assets/icons/**')
        .pipe($.plumber({ errorHandler: onError }))
        .pipe(gulp.dest(distFolderName+'/icons'))
        .pipe($.browserSync.reload({ stream: true }));
});


/////////////////////////////////////
// Delete the idstribution folder  //
/////////////////////////////////////
gulp.task('assets',function(){
  $.runSequence(['fonts','images','icons']);
});


///////////////////////////////////////////
// Copy html to the distribution folder  //
///////////////////////////////////////////
gulp.task('html', function(){
    gulp.src('src/*.html')
        .pipe($.plumber({ errorHandler: onError }))
        .pipe(gulp.dest('./'+distFolderName))
        .pipe($.browserSync.reload({ stream: true }));
});


////////////////////////////
// Process Task bower     //
////////////////////////////
gulp.task('bower',function(){
    return gulp.src('src/*.html')
               .pipe($.plumber({ errorHandler: onError }))
               .pipe(wiredep({
                    directory: 'bower_components',
                    exclude: []
               }))
               .pipe(gulp.dest('./src'))
});



//////////////////////////////////////////////////////////////////
// Process Task inject the Bower Dependencies in the html files //
//////////////////////////////////////////////////////////////////
gulp.task('injectBowerDep', function () {

    var css = $.filter('**/*.css'),
        js  = $.filter('**/*.js'),
        assets = $.useref.assets(),
        stream = gulp.src('src/*.html')
                     .pipe($.plumber({ errorHandler: onError }));

    return stream.pipe(assets)                              // Select all assets in the 'build' tag in the html file
                 .pipe(css)                                 // Select only .css assets
                 .pipe($.minifyCss({compatibility: 'ie8'})) // Minify or other changes
                 .pipe(css.restore())                       // Rollback css filter
                 .pipe(js)                                  // Select only .js assets
                 .pipe($.uglify())                                           // Uglify or other changes
                 .pipe(js.restore())                        // Rollback js filter
                 .pipe(assets.restore())                    // Restore all assets
                 .pipe($.useref())                          // Make changes in the html file links and script
                 .pipe(gulp.dest('./'+distFolderName));   // Save ides.html, vendor.js and vendor.js files
});



///////////////////////////
// Process Task connect  //
///////////////////////////
gulp.task('connect', function(){
    var routes = {
      // Should be '/bower_components': '../bower_components'
      // Waiting for https://github.com/shakyShane/browser-sync/issues/308
      '/bower_components': 'bower_components'
    };

    $.browserSync({
        server:{
            baseDir: [distFolderName],
            routes: routes
        }
    });
});


////////////////////////////////////////////////////////
// Process Task wacth in the files: less, html, assets//
////////////////////////////////////////////////////////
gulp.task('watch', function(){
    gulp.watch('src/less/**/*.less', ['less']);
    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/scripts/**/*.js', ['js']);
    gulp.watch('src/assets/fonts/**/*', ['fonts']);
    gulp.watch('src/assets/icons/**/*', ['icons']);
    gulp.watch('src/assets/images/**/*', ['images']);
});


///////////////////////////
// Process Task delete folder dist  //
///////////////////////////

gulp.task('clear',function(){
    $.del([distFolderName], function (err, paths) {
        console.log('Deleted folder dist');
    });
});

gulp.task('clear-all',function(){
    $.del([distFolderName, 'node_modules', 'bower_components'], function (err, paths) {
        console.log('Deleted folder dist');
    });
});


/////////////////
// main Tasks //
////////////////
gulp.task('default',function(){
    $.runSequence(['js','less','assets'], 'bower', 'html', 'connect', 'watch');
});


gulp.task('build',function(){
    $.runSequence(['js','less','assets'], 'bower', 'injectBowerDep');
});


