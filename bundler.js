var concat = require('concat-files');

concat([
  "./node_modules/angular/angular.min.js",
  "./node_modules/angular-route/angular-route.min.js",
  "./node_modules/angular-animate/angular-animate.min.js",
  "./node_modules/jquery/dist/jquery.min.js",
  "./node_modules/bootstrap/dist/js/bootstrap.min.js",
  "./node_modules/moment/min/moment.min.js"
], "./bundle.js", function (err) {
    if (err) throw err
    console.log('done');
});
