# gulp-jasmine-browser
[![Build Status](https://travis-ci.org/jasmine/gulp-jasmine-browser.svg?branch=master)](https://travis-ci.org/jasmine/gulp-jasmine-browser)

## Installing
`gulp-jasmine-browser` is available as an
[npm package](https://www.npmjs.com/package/gulp-jasmine-browser).

## Usage

### Create a Jasmine server to run specs in a browser

In `gulpfile.js`

```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('jasmine', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server());
});
```
In `gulp.src` include all files you need for testing other than jasmine itself.
This should include your spec files, and may also include your production JavaScript and
CSS files.

### Run jasmine tests headlessly

In `gulpfile.js`

```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('jasmine-phantom', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.phantomjs());
});
```

Note the `{console: true}` passed into specRunner.

GulpJasmineBrowser assumes that `phantomjs` is already installed and in your path.
It is only tested with PhantomJS 2.


### Usage with Webpack

If you would like to compile your front end assets with Webpack, for example to use
commonjs style require statements, you can pipe the compiled assets into
GulpJasmineBrowser.

In `gulpfile.js`

```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');
var webpack = require('gulp-webpack');

gulp.task('jasmine', function() {
  return gulp.src('spec/**/*_spec.js'])
    .pipe(webpack({watch: true, output: {filename: 'spec.js'}}))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server());
});
```

When using webpack, it is helpful to delay the jasmine server when the webpack bundle becomes invalid (to prevent serving
javascript that is out of date).  Adding the plugin to your webpack configuration, and adding the whenReady function to
the server configuration enables this behavior. 

```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');
var webpack = require('gulp-webpack');

gulp.task('jasmine', function() {
  var JasminePlugin = require('gulp-jasmine-browser/webpack/jasmine-plugin');
  var plugin = new JasminePlugin();
  return gulp.src('spec/**/*_spec.js'])
    .pipe(webpack({watch: true, output: {filename: 'spec.js'}, plugins: [plugin]}))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({whenReady: plugin.whenReady}));
});
```

## Development
### Getting Started
The application requires the following external dependencies:
* [Node](https://nodejs.org/)
* [Gulp](http://gulpjs.com/)
* [PhantomJS](http://phantomjs.org/) - if you want to run tests with Phantom, see your options under 'Usage.'

The rest of the dependencies are handled through:
```bash
npm install
```

Run tests with:
```bash
npm test
```

(c) Copyright 2015 Pivotal Software, Inc. All Rights Reserved.
