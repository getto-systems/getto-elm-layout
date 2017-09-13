"use strict";

const layout = function(opts){
  const path = opts.path;

  const fs = require("fs");
  const gulp    = require("gulp");
  const plumber = require("gulp-plumber");
  const ejs     = require("gulp-ejs");
  const rename  = require("gulp-rename");
  const elm     = require("gulp-elm");
  const uglify  = require("gulp-uglify");
  const server  = require("gulp-server-livereload");

  const template = function(){
    const data = JSON.parse(fs.readFileSync(path.routes));
    Object.keys(data).forEach(function(page){
      gulp.src(path.template)
        .pipe( plumber() )
        .pipe( ejs(data[page]) )
        .pipe( rename(function(name){
          if(name.extname == ".elm"){
            name.dirname = path.main;
            name.basename = data[page].module.replace(".","/");
          } else {
            name.dirname = path.html;
            name.basename = page;
          }
        }) )
        .pipe( gulp.dest(path.root) );
    });
  };

  const build = function(){
    gulp.src(path.src)
      .pipe( plumber() )
      .pipe( elm.bundle(path.bundle) )
      .pipe( uglify() )
      .pipe( gulp.dest(path.dist) );
  };

  const livereload = function(){
    gulp.src(path.html)
      .pipe( server({
        host: "0.0.0.0",
        livereload: {enable: true, port: process.env.LABO_PORT_PREFIX + 29},
        open: true
      }) );
    gulp.watch(path.src,["build"]);
    gulp.watch(path.routes,["template"]);
  };

  return {
    task: function(){
      gulp.task("template", template);
      gulp.task("build", build);
      gulp.task("livereload", livereload);
    }
  };
};

module.exports = layout;
