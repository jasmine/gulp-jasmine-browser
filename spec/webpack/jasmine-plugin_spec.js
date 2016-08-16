require('../spec_helper');

describe('JasminePlugin', function() {
  let subject, compiler;
  beforeEach(function() {
    const JasminePlugin = require('../../dist/webpack/jasmine-plugin');
    subject = new JasminePlugin();
    const {EventEmitter} = require('events');
    compiler = new EventEmitter();
    compiler.plugin = compiler.on;
    subject.apply(compiler);
  });

  describe('#whenReady', function() {
    let doneSpy, failSpy;
    beforeEach(function() {
      doneSpy = jasmine.createSpy('done');
      failSpy = jasmine.createSpy('fail');
    });

    it('does not resolve or reject the promise', function(done) {
      subject.whenReady().then(doneSpy, failSpy);
      expect(doneSpy).not.toHaveBeenCalled();
      expect(failSpy).not.toHaveBeenCalled();
      done();
    });

    describe('when the done event is emitted', function() {
      beforeEach(function() {
        compiler.emit('done');
      });

      it.async('resolves the promise', async function() {
        await subject.whenReady().then(doneSpy, failSpy);
        expect(doneSpy).toHaveBeenCalled();
      });

      describe('and then the invalid event is emitted', function() {
        it('resets the promise', function(done) {
          compiler.emit('invalid');
          subject.whenReady().then(doneSpy, failSpy);
          setTimeout(function() {
            expect(doneSpy).not.toHaveBeenCalled();
            expect(failSpy).not.toHaveBeenCalled();
            done();
          }, 1);
        });
      });
    });

    describe('when the invalid event is emitted', function() {
      it('rejects the promise', async function(done) {
        try {
          const whenReady = subject.whenReady();
          whenReady.then(doneSpy, failSpy);
          compiler.emit('invalid');
          await whenReady;
        } finally {
          expect(failSpy).toHaveBeenCalled();
          done();
        }
      });
    });
  });
});