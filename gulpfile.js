"use strict";

const layout = require("./")({
  path: {
    root: "./",
    html: "public/",
    dist: "public/dist/",
    template: [
      "templates/page.html",
      "templates/page.elm"
    ],
    routes: "config/routes.json",
    src:  ["src/**/*.elm","pages/**/*.elm"],
    main: "pages/Main/",
    bundle: "app.js"
  }
});

layout.task();
