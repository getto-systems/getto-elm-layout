"use strict";

const layout = function(opts){
  const path = opts.path;
  const without_uglify = opts.without_uglify;

  const gulp    = require("gulp");
  const pump    = require("pump");
  const plumber = require("gulp-plumber");

  const routes = function(cb){
    const shell = require("gulp-shell");

    pump([
      gulp.src(path.routes.script, {read: false}),
      plumber(),
      shell([
        "BUNDLE_PATH=" + path.ruby + " bundle exec ruby <%= file.path %>"
      ]),
    ],cb);
  };

  const template = function(cb){
    const fs     = require("fs");
    const ejs    = require("gulp-ejs");
    const rename = require("gulp-rename");

    const data = JSON.parse(fs.readFileSync(path.routes.data));
    Object.keys(data).forEach(function(page){
      pump([
        gulp.src(path.template),
        plumber(),
        ejs(data[page]),
        rename(function(name){
          if(name.extname == ".elm"){
            name.dirname = path.main;
            name.basename = data[page].module.replace(/\./g,"/");
          } else {
            name.dirname = path.html;
            name.basename = page;
          }
        }),
        gulp.dest(path.root),
      ],cb);
    });
  };

  const build = function(cb){
    const elm    = require("gulp-elm");
    const uglify = require("gulp-uglify");

    if(!without_uglify) {
      pump([
        gulp.src(path.build),
        plumber(),
        elm.bundle(path.elm),
        uglify(),
        gulp.dest(path.dist),
      ],cb);
    } else {
      pump([
        gulp.src(path.build)
        plumber(),
        elm.bundle(path.elm),
        gulp.dest(path.dist),
      ],cb);
    }
  };

  const test = function(cb){
    const elmTest = require("gulp-elm-test");

    pump([
      gulp.src(path.test),
      plumber(),
      elmTest(),
    ],cb);
  };

  const livereload = function(cb){
    const server = require("gulp-server-livereload");

    pump([
      gulp.src(path.html),
      server({
        host: "0.0.0.0",
        livereload: {enable: true, port: process.env.LABO_PORT_PREFIX + 29},
        open: true
      }),
    ],cb);
    gulp.watch(path.routes.script,["routes"]);
    gulp.watch(path.routes.data,["template"]);
    gulp.watch(path.watch.build,["build"]);
    gulp.watch(path.watch.test,["test"]);
  };

  return {
    task: function(){
      gulp.task("routes", routes);
      gulp.task("template", template);
      gulp.task("build", build);
      gulp.task("test", test);
      gulp.task("livereload", livereload);
    }
  };
};

module.exports = layout;
