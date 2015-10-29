/* Desarrollado por Widget Personal Computer C.A. */
/* VERTION: 0.5.0 */

//////////////////////
// Convention names //
//////////////////////
var development = 'DEV',        			// Development's tag name
    distribution = 'DIST',      			// Distribution's tag name
    distFolderName = 'scaffolar-html',    	// Dist Folder Name
    ugly_minify = false,         			// Value of uglyfi files js and css.
    isBuild = false;						// Value to call browserSync.reload task


////////////////////////////////
// Overrides Bower Main Array //
////////////////////////////////image
var overridesComp = {
    bootstrap: {
        main: [
            "./dist/js/bootstrap.js",
            "./dist/css/bootstrap.css"
        ]
    }
};

//////////////////////////
// Environment variables //
///////////////////////////
var ENV = development;distribution

function isDevelopment() { return ENV === development; }
function isDistribution() { return ENV === distribution; }

var gulp = require('gulp');
var wiredep = require('wiredep').stream;

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*','del', 'browser-sync', 'main-bower-files','bower']
});


////////////////////////////////////////////////////////
// sourcemap, concats, uglifies, sufix .min and write //
////////////////////////////////////////////////////////
function processJS(path, name){
	var source = gulp.src(path)
    	.pipe($.plumber())
        .pipe($.if(isDevelopment(), $.sourcemaps.init()))
        .pipe($.concat(name + '.js', { }))
        .pipe($.if(ugly_minify, $.uglify()))
		.pipe($.rename({ suffix: '.min' }))
		.pipe($.if(isDevelopment(), $.sourcemaps.write()))
		.pipe(gulp.dest(distFolderName+'/js'));

		if(isDevelopment())
        	$.browserSync.reload();
};



////////////////////////////////////////////////////////
// sourcemap, concats, uglifies, sufix .min and write //
////////////////////////////////////////////////////////
function processLess(path, name){
    var source = gulp.src(path)
    	.pipe($.plumber())
        .pipe($.if(isDevelopment(), $.sourcemaps.init()))
        .pipe($.concat(name + '.css', { }))
        .pipe($.less())
        .pipe($.autoprefixer(
			'last 2 version',
			'> 1%',
			'ie 8',
			'ie 9',
			'ios 6',
			'android 4'
        ))
        .pipe($.if(ugly_minify, $.minifyCss({compatibility: 'ie8'})))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.if(isDevelopment(), $.sourcemaps.write()))
        .pipe($.size())
        .pipe(gulp.dest(distFolderName+'/css'));

        if(isDevelopment())
        	$.browserSync.reload();
};


////////////////////////////////////////////////////////
// sourcemap, concats, uglifies, sufix .min and write //
////////////////////////////////////////////////////////
function processClearLess(path, name){
    var source = gulp.src(path)
    	.pipe($.plumber())
        // .pipe($.if(isDevelopment(), $.sourcemaps.init()))
        .pipe($.concat(name + '.css', { }))
        .pipe($.less())
        .pipe($.autoprefixer(
			'last 2 version',
			'> 1%',
			'ie 8',
			'ie 9',
			'ios 6',
			'android 4'
        ))
        .pipe($.if(ugly_minify, $.minifyCss({compatibility: 'ie8'})))
        .pipe($.rename({ suffix: '.min' }))
        // .pipe($.if(isDevelopment(), $.sourcemaps.write()))
        .pipe($.size())
        .pipe(gulp.dest(distFolderName+'/css'));
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
    processLess('src/less/vendors.less', 'vendors');
    processLess('src/less/theme.less', 'theme');
});


/////////////////////////////
// Process all LESS files  //
/////////////////////////////
gulp.task('build-clear-less', function(){
    processClearLess('src/less/clear.less', 'clear');
});

///////////////////////////////
// Process all FONTS files   //
///////////////////////////////
gulp.task('fonts', function(){
	var files = $.mainBowerFiles();
	files.push('src/assets/fonts/**');

    var source = gulp.src(files)
    	.pipe($.plumber())
    	.pipe($.filter('**/*.{eot,svg,ttf,woff,woff2,otf}'))
    	.pipe($.size())
        .pipe(gulp.dest(distFolderName+'/fonts'));

        if(isDevelopment())
        	$.browserSync.reload();
});


////////////////////////////////
// Process all IMAGES files   //
////////////////////////////////
gulp.task('images', function(){

	$.cache.clearAll();

    var files = $.mainBowerFiles();
    files.push('src/assets/images/**/*.{png,jpg,jpeg,svg,gif}');

    var source = gulp.src(files)
        .pipe($.plumber())
        .pipe($.filter('**/*.{png,jpg,jpeg,svg,gif}'))
        // .pipe($.imagemin({
        //     progressive: true,
        //     svgoPlugins: [{removeViewBox: false}],
        //     use: [$.imageminPngquant()]
        // }))
        .pipe($.size())
        .pipe(gulp.dest(distFolderName + '/images'));

        if(isDevelopment())
        	$.browserSync.reload();
});


///////////////////////////////
// Process all ICONS files   //
///////////////////////////////
gulp.task('icons', function(){
    var source = gulp.src('src/assets/icons/*.ico')
    	.pipe($.plumber())
    	.pipe($.size())
        .pipe(gulp.dest(distFolderName+'/icons'));

        if(isDevelopment())
        	$.browserSync.reload();
});

//////////////////////////////////
// Process all Files like PDF   //
//////////////////////////////////
gulp.task('files', function(){
    var source = gulp.src('src/assets/files/**/*.*')
    	.pipe($.plumber())
    	.pipe($.size())
        .pipe(gulp.dest(distFolderName+'/files'));

        if(isDevelopment())
        	$.browserSync.reload();
});


/////////////////////////////////////
// Delete the idstribution folder  //
/////////////////////////////////////
gulp.task('assets',function(){
	$.runSequence(['fonts','images','icons', 'files']);
});


///////////////////////////////////////////
// Copy html to the distribution folder  //
///////////////////////////////////////////
gulp.task('html', function(){
    var source = gulp.src('src/*.html')
    	.pipe($.plumber())
    	.pipe($.size())
        .pipe(gulp.dest('./'+distFolderName));

        if(isDevelopment())
        	$.browserSync.reload();
});


////////////////////////////
// Process Task bower     //
////////////////////////////
gulp.task('bower',function(){
    return gulp.src('src/*.html')
    		   .pipe($.plumber())
               .pipe(wiredep({
	               	overrides: overridesComp,
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
        stream = gulp.src('src/*.html');

    return stream.pipe($.plumber())
    			 .pipe(assets)                              // Select all assets in the 'build' tag in the html file
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
            baseDir: ['src', distFolderName],
            routes: routes
        }
    });
});

/////////////////////////////
// Process Task bower-json //
/////////////////////////////

gulp.task('bower-json-install', function(cb){
    $.bower.commands.install([], {save: true}, {})
    .on('end', function(installed){
		cb();
		$.runSequence('bower','html');
		$.browserSync.reload();
    });
});


////////////////////////////////////////////////////////
// Process Task wacth in the files: less, html, assets//
////////////////////////////////////////////////////////
gulp.task('watch', function(){
    gulp.watch('src/less/**/*.less', ['less']);
    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/scripts/**/*.js', ['js']);
    gulp.watch('src/assets/fonts/**/*.{eot,svg,ttf,woff,woff2,otf}', ['fonts']);
    gulp.watch('src/assets/icons/**/*.ico', ['icons']);
    gulp.watch('src/assets/files/**/*.*', ['files']);
    gulp.watch('src/assets/images/**/*{.png, .jpg, .jpeg, .svg, .gif}', ['images']);
    gulp.watch('bower.json',['bower-json-install']);
});



//////////////////////////////////////
// Process Task delete folder dist  //
//////////////////////////////////////

gulp.task('clear',function(){
    $.del([distFolderName, 'dist'], function (err, paths) {
        console.log('Deleted folder dist and ' + distFolderName);
    });
});

gulp.task('clear-all',function(){
    $.del([distFolderName, 'dist', 'node_modules', 'bower_components'], function (err, paths) {
        console.log('Deleted folder '+distFolderName);
    });
});


///////////////////////////////////////////////////////
// Process Task ful Value of uglyfi files js and css //
///////////////////////////////////////////////////////
gulp.task('build-full',function(){
    ugly_minify = false;
    ENV = distribution;

    $.runSequence(['js', 'build-clear-less', 'less','assets'], 'bower', 'injectBowerDep');
});


gulp.task('build',function(){
	ENV = distribution;
    $.runSequence(['js', 'build-clear-less', 'less','assets'], 'bower', 'injectBowerDep');
});


/////////////////
// main Tasks //
////////////////
gulp.task('default',function(){
    distFolderName = 'dist';
    $.runSequence(['js', 'build-clear-less', 'less', 'assets'], 'bower', 'html', 'connect', 'watch');
});
