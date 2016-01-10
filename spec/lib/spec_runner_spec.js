require('../spec_helper');

describe('SpecRunner', () => {
  let cheerio, consoleJs, consoleBootJs, jasmineCssFiles, jasmineJsFiles, subject;

  beforeEach(() => {
    const fs = require('fs');
    const path = require('path');
    const jasmineCore = require('jasmine-core');
    cheerio = require('cheerio');
    consoleJs = fs.readFileSync(path.resolve(__dirname, '..', '..', 'dist', 'lib', 'console.js'), 'utf8');
    consoleBootJs = fs.readFileSync(path.resolve(__dirname, '..', '..', 'dist', 'lib', 'console_boot.js'), 'utf8');
    jasmineCssFiles = jasmineCore.files.cssFiles.map(fileName =>
      fs.readFileSync(path.resolve(jasmineCore.files.path, fileName), 'utf8')
    );
    jasmineJsFiles = jasmineCore.files.jsFiles.map(fileName =>
      fs.readFileSync(path.resolve(jasmineCore.files.path, fileName), 'utf8')
    );
    const SpecRunner = require('../../dist/lib/spec_runner');
    subject = new SpecRunner({console: true});
  });

  it('includes all of the Jasmine library files', () => {
    const html = subject.contents.toString();
    const tags = cheerio.load(html)('script,style,link');

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

  it('allows adding additional css and js files', () => {
    subject.addFile('foo.js');
    subject.addFile('bar.css');
    subject.addFile('foo.js');
    subject.addFile('bar.css');
    subject.addFile('bar.css');

    const html = subject.contents;
    const tags = cheerio.load(html)('script,style,link');

    expect(tags.length).toBe(8);

    expect(tags.eq(6).attr('src')).toBe('foo.js');
    expect(tags.eq(6).is('script')).toBe(true);

    expect(tags.eq(7).attr('href')).toBe('bar.css');
    expect(tags.eq(7).attr('type')).toBe('text/css');
    expect(tags.eq(7).attr('rel')).toBe('stylesheet');
    expect(tags.eq(7).is('link')).toBe(true);
  });
});