require('../spec_helper');

describe('Server', function() {
  var app, createServer, files, request;
  beforeEach(function() {
    request = require('../support/supertest_promisified');
    createServer = require('../../dist/lib/server').createServer;
    files = {
      'specRunner.html': 'The Spec Runner'
    };
  });

  describe('when the server is not passed options', function() {
    beforeEach(function() {
      app = createServer(files);
    });

    describe('GET /', function() {
      it('renders the spec runner', async function(done) {
        var res = await request(app).get('/').expect(200);
        expect(res.text).toContain('The Spec Runner');
        done();
      });
    });

    describe('GET *', function() {
      describe('with a file that exists', function() {
        beforeEach(function() {
          files['foo.js'] = 'Foo Content';
        });

        it('renders the file', async function(done) {
          var res = await request(app).get('/foo.js').expect(200);
          expect(res.text).toContain('Foo Content');
          done();
        });
      });

      describe('with a file that does not exist', function() {
        it('returns 404', async function(done) {
          var res = await request(app).get('/bar.js');
          expect(res.statusCode).toBe(404);
          done();
        });
      });
    });
  });

  describe('when the server is passed whenReady', function() {
    var whenReady;
    beforeEach(function() {
      whenReady = new Deferred();
      app = createServer(files, {whenReady: () => whenReady});
  });

    describe('GET /', function() {
      describe('whenReady is resolved', function() {
        it('renders the valid version of spec runner', async function(done) {
          setTimeout(function() {
            files['specRunner.html'] = 'The New Version';
            whenReady.resolve();
          }, 100);

          var res = await request(app).get('/').expect(200);
          expect(res.text).toContain('The New Version');
          done();
        });

        it('does not render intermediate invalid states', async function(done) {
          setTimeout(function() {
            files['specRunner.html'] = 'The Bad Version';
            whenReady.reject();
            whenReady = new Deferred();
          }, 100);

          setTimeout(function() {
            files['specRunner.html'] = 'The Good Version';
            whenReady.resolve();
          }, 200);

          var res = await request(app).get('/').expect(200);
          expect(res.text).toContain('The Good Version');
          done();
        });
      });
    });
  });
});