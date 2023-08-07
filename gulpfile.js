const { src, dest, parallel, series, watch } = require("gulp");
const sass = require("gulp-sass");
const cleancss = require("gulp-clean-css");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
// const newer        = require('gulp-newer');
// const rsync        = require('gulp-rsync');
const del = require("del");
const rename = require("gulp-rename");
const rigger = require("gulp-rigger");
const cssbeautify = require("gulp-cssbeautify");

/* TODO transfer scripts here from third-party sources */
/*
function scripts() {
    return src([
        // 'app/libs/jquery/dist/jquery.min.js',
        'app/js/common.js',
    ], {sourcemaps: true})
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js', {sourcemaps: '.'}))
        .pipe(browserSync.stream());
}
*/

function scripts() {
  return src("app/js/*.js", { sourcemaps: false, base: "app/js/" })
    .pipe(rigger())
    .pipe(dest("dist/js"))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min",
        extname: ".js",
      })
    )
    .pipe(dest("dist/js", { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

function browsersync() {
  browserSync.init({
    server: { baseDir: "dist/" },
    notify: false,
    online: true,
  });
}

/* Used in dev mode for quick refresh */
function styles() {
  return (
    src("app/sass/**/*.scss")
      .pipe(sass())
      .pipe(autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true }))
      // .pipe(autoprefixer({overrideBrowserslist: ['last 15 versions'], grid: true}))
      // .pipe(dest('app/css'))
      // .pipe(cleancss({level: {1: {specialComments: 0}}/* format: 'beautify' */}))
      .pipe(rename({ suffix: ".min", prefix: "" }))
      .pipe(cleancss())
      .pipe(dest("dist/css"))
      .pipe(browserSync.stream())
  );
}

/* Used for build completed files */
function styles_build() {
  return (
    src("app/sass/**/*.scss", { sourcemaps: false })
      .pipe(sass())
      .pipe(autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true }))
      .pipe(cssbeautify())
      .pipe(dest("dist/css"))
      .pipe(cleancss({ level: { 1: { specialComments: 0 } } /* format: 'beautify' */ }))
      .pipe(rename({ suffix: ".min", prefix: "" }))
      //.pipe(dest('dist/css', {sourcemaps: '.'}))
      .pipe(browserSync.stream())
  );
}

function images() {
  return (
    src("app/img/**/*")
      //.pipe(cache(imagemin())) // Cache Images
      .pipe(dest("dist/img"))
      .pipe(browserSync.stream())
  );
}

function layouts() {
  return src(["app/*.html"]).pipe(dest("dist")).pipe(browserSync.stream());
}

function remove_dist() {
  return del.sync("dist/");
}

function fonts_build() {
  return src(["app/fonts/**/*"]).pipe(dest("dist/fonts"));
}

function libs_build() {
  return src("app/js/libs/**/*.js", { sourcemaps: false, base: "app/js/" }).pipe(dest("dist/js"));
}

function favicon() {
  return src("app/favicon.*", { sourcemaps: false, base: "app/" }).pipe(dest("dist/"));
}

function startwatch() {
  watch("app/sass/**/*.scss", styles);
  watch("app/*.html", layouts);
  //watch(['app/**/*.js', '!app/js/*.min.js'], scripts);
  watch("app/js/**/*.js", scripts);
  watch("app/img/**/*", images);
}

exports.browsersync = browsersync;
exports.assets = series(styles, scripts);
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.layouts = layouts;
exports.clean = remove_dist;
exports.libs = libs_build;
exports.favicon = favicon;
exports.build = parallel(styles_build, fonts_build, scripts, libs_build);
exports.default = parallel(styles, scripts, browsersync, startwatch, images, layouts);

/*
export NVM_DIR=~/.nvm
source ~/.nvm/nvm.sh
*/
