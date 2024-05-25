const { src, dest, task, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const cssnano = require("cssnano");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const csscomb = require("gulp-csscomb");
const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");
const sortCSSmq = require("sort-css-media-queries");

const PATH = {
  scssRoot: "./assets/scss/style.scss",
  scssFiles: "./assets/scss/**/*.scss",
  scssFolder: "./assets/scss/",
  cssFolder: "./assets/css",
  htmlFiles: "./**/*.html",
  jsFiles: "./assets/js/**/*.js",
};

const PLUGINS = [
  autoprefixer({
    overrideBrowserslist: ["last 5 versions", " > 1%"],
    cascade: true,
  }),
  mqpacker({ sort: sortCSSmq }),
];

function scss() {
  return src(PATH.scssRoot)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(csscomb())
    .pipe(dest(PATH.cssFolder))
    .pipe(browserSync.stream());
}

function scssMin() {
  const plugForMin = [...PLUGINS, cssnano({ preset: "default" })];
  return src(PATH.scssRoot)
    .pipe(sass().on("error", sass.logError))
    .pipe(csscomb())
    .pipe(postcss(plugForMin))
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(PATH.cssFolder));
}

function scssDev() {
  return src(PATH.scssRoot, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([PLUGINS[1]]))
    .pipe(dest(PATH.cssFolder, { sourcemaps: true }))
    .pipe(dest("dest-path", { sourcemaps: "." }))
    .pipe(browserSync.stream());
}

function comb() {
  return src(PATH.scssFiles).pipe(csscomb()).pipe(dest(PATH.scssFolder));
}

function syncInit() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
}

async function reload() {
  browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.htmlFiles, reload);
  watch(PATH.jsFiles, reload);
  watch(PATH.scssFiles, series(scss, scssMin));
}

function watchFilesDev() {
  syncInit();
  watch(PATH.htmlFiles, reload);
  watch(PATH.jsFiles, reload);
  watch(PATH.scssFiles, series(scssDev));
}

task("scss", scss);
task("min", scssMin);
task("comb", comb);
task("watch", watchFiles);
task("dev", watchFilesDev);