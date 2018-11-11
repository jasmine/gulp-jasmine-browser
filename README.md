# gulp-jasmine-browser

Run jasmine tests in a browser or headless browser using gulp.

[![Build Status](https://travis-ci.org/jasmine/gulp-jasmine-browser.svg?branch=master)](https://travis-ci.org/jasmine/gulp-jasmine-browser)

## Installing
`gulp-jasmine-browser` is available as an
[npm package](https://www.npmjs.com/package/gulp-jasmine-browser).

## Usage

Gulp Jasmine Browser currently works with any synchronous method of loading files. The beginning examples all assume basic script loading. 
If you are using CommonJS to load files, you may want to skip to [Usage with Webpack](#usage-with-webpack)

### Create a Jasmine server to run specs in a browser

In `gulpfile.js`

```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('jasmine', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 8888}));
});
```
In `gulp.src` include all files you need for testing other than jasmine itself.
This should include your spec files, and may also include your production JavaScript and
CSS files.

The jasmine server will run on the `port` given to `server`, or will default to port 8888.

### Watching for file changes

To have the server automatically refresh when files change, you will want something like [gulp-watch](https://github.com/floatdrop/gulp-watch).

```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');
var watch = require('gulp-watch');

gulp.task('jasmine', function() {
  var filesForTest = ['src/**/*.js', 'spec/**/*_spec.js'];
  return gulp.src(filesForTest)
    .pipe(watch(filesForTest))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 8888}));
});
```

If you are using Webpack or Browserify, you may want to use their watching mechanisms instead of this example.

### Run jasmine tests headlessly

In `gulpfile.js`

For Headless Chrome
```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('jasmine-chrome', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless({driver: 'chrome'}));
});
```

To use this driver, [puppeteer](https://www.npmjs.com/package/puppeteer) must be installed in your project.

For PhantomJs
```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('jasmine-phantom', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless({driver: 'phantomjs'}));
});
```

To use this driver, the PhantomJS npm [package](https://www.npmjs.com/package/phantomjs) must be installed in your project.

GulpJasmineBrowser assumes that if the package is not installed `phantomjs` is already installed and in your path.
It is only tested with PhantomJS 2.

For SlimerJs
```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('jasmine-slimer', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless({driver: 'slimerjs'}));
});
```

To use this driver, the SlimerJS npm [package](https://www.npmjs.com/package/slimerjs) must be installed in your project.

Note the `{console: true}` passed into specRunner.



### Usage with Webpack

If you would like to compile your front end assets with Webpack, for example to use
commonjs style require statements, you can pipe the compiled assets into
GulpJasmineBrowser.

In `gulpfile.js`

```js
var gulp = require('gulp');
var jasmineBrowser = require('gulp-jasmine-browser');
var webpack = require('webpack-stream');

gulp.task('jasmine', function() {
  return gulp.src(['spec/**/*_spec.js'])
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
var webpack = require('webpack-stream');

gulp.task('jasmine', function() {
  var JasminePlugin = require('gulp-jasmine-browser/webpack/jasmine-plugin');
  var plugin = new JasminePlugin();
  return gulp.src(['spec/**/*_spec.js'])
    .pipe(webpack({watch: true, output: {filename: 'spec.js'}, plugins: [plugin]}))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({whenReady: plugin.whenReady}));
});
```
### Options
#### for specRunner
##### console
Generates a console reporter for the spec runner that should be used with a headless browser.

##### profile
Prints out timing information for your slowest specs after Jasmine is done.
If used in the browser, this will print into the developer console. In headless mode, this will print to the terminal.

#### for server and headless server

##### catch
If true, the headless server catches exceptions raised while running tests

##### driver
Sets the driver used by the headless server

##### findOpenPort
To force the headless port to use a specific port you can pass an option to the headless configuration so it does not search for an open port.
```js
gulp.task('jasmine', function() {
  var port = 8080;
  return gulp.src(['spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.headless({port: 8080, findOpenPort: false}));
});
```

##### onCoverage
Called with the `__coverage__` from the browser, can be used with code coverage like [istanbul](http://gotwarlost.github.io/istanbul/) 

##### port
Sets the port for the server

##### random
If true, the headless server runs the tests in random order

##### reporter
Provide a [custom reporter](http://jasmine.github.io/2.1/custom_reporter.html) for the output, defaults to the jasmine
terminal reporter.

##### seed
Sets the randomization seed if randomization is turned on

##### sourcemappedStacktrace
**EXPERIMENTAL** asynchronously loads the sourcemapped stacktraces for better stacktraces in chrome and firefox.

##### spec
Only runs specs that match the given string

##### throwFailures
If true, the headless server fails tests on the first failed expectation

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

Note: `npm test` need a webdriver server up and running. An easy way of accomplish that is by using `webdriver-manager`:

```bash
npm install --global webdriver-manager
webdriver-manager update
webdriver-manager start
```

(c) Copyright 2016 Pivotal Software, Inc. All Rights Reserved.
