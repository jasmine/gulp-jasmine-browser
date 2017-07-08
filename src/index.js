import {obj as through} from 'through2';
import {headless, server, slimerjs, phantomjs, chrome} from './lib/headless';
import SpecRunner from './lib/spec_runner';

function specRunner(options) {
  const specRunner = new SpecRunner(options);
  return through(function(file, encoding, next) {
    this.push(file);
    this.push(specRunner.addFile(file.relative));
    next();
  });
}

export {headless, server, slimerjs, phantomjs, chrome, specRunner};