require('../spec_helper');

describe('SpecRunner', function() {
  var fs = require('fs');
  var path = require('path');
  var cheerio = require('cheerio');
  var jasmineCore = require('jasmine-core');
  var SpecRunner = require('../../dist/lib/spec_runner');

  var jasmineJsFiles = jasmineCore.files.jsFiles.map(fileName =>
    fs.readFileSync(path.resolve(jasmineCore.files.path, fileName), 'utf8')
  );
  var jasmineCssFiles = jasmineCore.files.cssFiles.map(fileName =>
    fs.readFileSync(path.resolve(jasmineCore.files.path, fileName), 'utf8')
  );
  var consoleJs = fs.readFileSync(path.resolve(__dirname, '..', '..', 'dist', 'lib', 'console.js'), 'utf8');
  var consoleBootJs = fs.readFileSync(path.resolve(__dirname, '..', '..', 'dist', 'lib', 'console_boot.js'), 'utf8');

  var specRunnerFile;
  beforeEach(function() {
    specRunnerFile = new SpecRunner({console: true});
  });

  it('includes all of the Jasmine library files', function() {
    var html = specRunnerFile.contents.toString();
    var tags = cheerio.load(html)('script,style,link');

    expect(tags.length).toBe(6);

    expect(tags.eq(0).is('style')).toBe(true);
    expect(tags.eq(0).html()).toBe(jasmineCssFiles[0]);

    expect(tags.eq(1).is('script')).toBe(true);
    expect(tags.eq(1).html()).toBe(jasmineJsFiles[0]);

    expect(tags.eq(2).is('script')).toBe(true);
    expect(tags.eq(2).html()).toBe(jasmineJsFiles[1]);

    expect(tags.eq(3).is('script')).toBe(true);
    expect(tags.eq(3).html()).toBe(jasmineJsFiles[2]);

    expect(tags.eq(4).is('script')).toBe(true);
    expect(tags.eq(4).html()).toBe(consoleJs);

    expect(tags.eq(5).is('script')).toBe(true);
    expect(tags.eq(5).html()).toBe(consoleBootJs);

  });

  it('allows adding additional css and js files', function() {
    specRunnerFile.addFile('foo.js');
    specRunnerFile.addFile('bar.css');
    specRunnerFile.addFile('foo.js');
    specRunnerFile.addFile('bar.css');
    specRunnerFile.addFile('bar.css');

    var html = specRunnerFile.contents;
    var tags = cheerio.load(html)('script,style,link');

    expect(tags.length).toBe(8);

    expect(tags.eq(6).attr('src')).toBe('foo.js');
    expect(tags.eq(6).is('script')).toBe(true);

    expect(tags.eq(7).attr('href')).toBe('bar.css');
    expect(tags.eq(7).attr('type')).toBe('text/css');
    expect(tags.eq(7).attr('rel')).toBe('stylesheet');
    expect(tags.eq(7).is('link')).toBe(true);
  });
});