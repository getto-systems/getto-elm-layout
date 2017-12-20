"use strict";

const layout = function(opts){
  const path = opts.path;
  const without_uglify = opts.without_uglify;

  const fs = require("fs");
  const gulp    = require("gulp");
  const plumber = require("gulp-plumber");
  const ejs     = require("gulp-ejs");
  const rename  = require("gulp-rename");
  const elm     = require("gulp-elm");
  const uglify  = require("gulp-uglify");
  const server  = require("gulp-server-livereload");
  const shell   = require("gulp-shell");

  const routes = function(){
    gulp.src(path.routes.script, {read: false})
      .pipe( plumber() )
      .pipe(shell([
        "BUNDLE_PATH=" + path.ruby + " bundle exec ruby <%= file.path %>"
      ]));
  };

  const template = function(){
    const data = JSON.parse(fs.readFileSync(path.routes.data));
    Object.keys(data).forEach(function(page){
      gulp.src(path.template)
        .pipe( plumber() )
        .pipe( ejs(data[page]) )
        .pipe( rename(function(name){
          if(name.extname == ".elm"){
            name.dirname = path.main;
            name.basename = data[page].module.replace(/\./g,"/");
          } else {
            name.dirname = path.html;
            name.basename = page;
          }
        }) )
        .pipe( gulp.dest(path.root) );
    });
  };

  const build = function(){
    if(!without_uglify) {
      gulp.src(path.build)
        .pipe( plumber() )
        .pipe( elm.bundle(path.elm) )
        .pipe( uglify() )
        .pipe( gulp.dest(path.dist) );
    } else {
      gulp.src(path.build)
        .pipe( plumber() )
        .pipe( elm.bundle(path.elm) )
        .pipe( gulp.dest(path.dist) );
    }
  };

  const livereload = function(){
    gulp.src(path.html)
      .pipe( server({
        host: "0.0.0.0",
        livereload: {enable: true, port: process.env.LABO_PORT_PREFIX + 29},
        open: true
      }) );
    gulp.watch(path.routes.script,["routes"]);
    gulp.watch(path.routes.data,["template"]);
    gulp.watch(path.watch,["build"]);
  };

  return {
    task: function(){
      gulp.task("routes", routes);
      gulp.task("template", template);
      gulp.task("build", build);
      gulp.task("livereload", livereload);
    }
  };
};

module.exports = layout;
